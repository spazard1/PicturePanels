import React, { useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import { usePlayers } from "../common/usePlayers";
import Panels from "./Panels";
import TeamInfos from "../teaminfos/TeamInfos";
import Players from "./Players";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import FadedBox from "./FadedBox";
import { getImageEntity } from "./getImageEntity";
import { useGameboardPing } from "./useGameboardPing";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Welcome from "./Welcome";

import "./Gameboard.css";
import "animate.css";

export default function Gameboard() {
  useBodyClass("gameboard");

  const [welcomeState, setWelcomeState] = useState("");
  const [gameStateIdDisplay, setGameStateIdDisplay] = useState(false);
  const [gameStateIdDisplayText, setGameStateIdDisplayText] = useState();
  const [uploadedByDisplay, setUploadedByDisplay] = useState(false);
  const [uploadedByDisplayText, setUploadedByDisplayText] = useState();
  const [answerDisplay, setAnswerDisplay] = useState(false);
  const [answerDisplayText, setAnswerDisplayText] = useState();
  const [gameStateId, setGameStateId] = useState();

  const onWelcomeStateChange = (welcomeState) => {
    setWelcomeState(welcomeState);
  };

  const onCancel = () => {
    setWelcomeState("");
  };

  const onJoinGame = (gameStateId) => {
    setGameStateId(gameStateId);
  };

  const onGameStateLoadError = () => {};

  useSignalRConnection("gameStateId=" + gameStateId, gameStateId);

  const { gameState } = useGameState(gameStateId, onGameStateLoadError);
  const { players } = usePlayers(gameStateId);
  useGameboardPing(gameStateId);

  useEffect(() => {
    if (!gameStateId || !gameState) {
      return;
    }

    setWelcomeState("Playing");

    if (gameState.revealedPanels) {
      setGameStateIdDisplayText("Join the game!\u00A0\u00A0\u00A0picturepanels.net\u00A0\u00A0\u00A0" + gameState.gameStateId);
    } else {
      setGameStateIdDisplayText(gameState.gameStateId);
    }

    if (gameState.turnType !== "Welcome" && gameState.turnType !== "EndGame") {
      setGameStateIdDisplay(true);
    } else {
      setGameStateIdDisplay(false);
      setUploadedByDisplay(false);
    }
  }, [gameState, gameStateId]);

  useEffect(() => {
    if (!gameStateId || !gameState) {
      return;
    }

    getImageEntity(gameStateId, (imageEntity) => {
      if (!imageEntity) {
        return;
      }
      if (imageEntity.uploadedBy) {
        setUploadedByDisplay(true);
        setUploadedByDisplayText("Uploaded by: " + imageEntity.uploadedBy);
      } else {
        setUploadedByDisplay(false);
      }

      if (imageEntity.name) {
        setAnswerDisplayText(imageEntity.name);
        setAnswerDisplay(true);
      } else {
        setAnswerDisplay(false);
      }
    });
  }, [gameStateId, gameState]);

  return (
    <>
      <Modal show={true} centered>
        <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary">Close</Button>
          <Button variant="primary">Save Changes</Button>
        </Modal.Footer>
      </Modal>
      {welcomeState !== "Playing" && (
        <Welcome welcomeState={welcomeState} onWelcomeStateChange={onWelcomeStateChange} onJoinGame={onJoinGame} onCancel={onCancel}></Welcome>
      )}
      <TeamInfos gameState={gameState} />
      <Players players={players}></Players>
      <Panels
        gameStateId={gameStateId}
        players={players}
        roundNumber={gameState.roundNumber ?? 0}
        revealedPanels={gameState.revealedPanels ?? []}
        teamTurn={gameState.teamTurn ?? 1}
        turnType={gameState.turnType}
        teamIsCorrect={gameState.teamOneCorrect || gameState.teamTwoCorrect}
      />
      <FadedBox
        displayState={gameStateIdDisplay}
        className="gameStateIdFadedBox"
        entranceClassName=" animate__bounceInLeft"
        exitClassName=" animate__bounceOutLeft"
      >
        {gameStateIdDisplayText}
      </FadedBox>
      <FadedBox
        displayState={uploadedByDisplay}
        className="uploadedByFadedBox"
        entranceClassName=" animate__bounceInRight"
        exitClassName=" animate__bounceOutRight"
      >
        {uploadedByDisplayText}
      </FadedBox>
      <FadedBox
        displayState={answerDisplay}
        className="answerFadedBox"
        entranceClassName=" animate__bounceInTop"
        exitClassName=" animate__bounceOutTop"
      >
        {answerDisplayText}
      </FadedBox>
    </>
  );
}
