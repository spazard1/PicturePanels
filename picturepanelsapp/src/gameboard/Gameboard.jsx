import React, { useCallback, useEffect, useRef, useState } from "react";
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
import StartGame from "./StartGame";
import Welcome from "./Welcome";

import "./Gameboard.css";
import "animate.css";
import postGameState from "../common/postGameState";
import RoundNumber from "./RoundNumber";

export default function Gameboard() {
  useBodyClass("gameboard");

  const [startGameState, setStartGameState] = useState("");
  const [roundNumberAnimateDisplay, setRoundNumberAnimateDisplay] = useState(false);
  const [roundNumberAnimateDisplayText, setRoundNumberAnimateDisplayText] = useState();
  const [gameStateIdDisplay, setGameStateIdDisplay] = useState(false);
  const [gameStateIdDisplayText, setGameStateIdDisplayText] = useState();
  const [uploadedByDisplay, setUploadedByDisplay] = useState(false);
  const [uploadedByDisplayText, setUploadedByDisplayText] = useState();
  const [answerDisplay, setAnswerDisplay] = useState(false);
  const [answerDisplayText, setAnswerDisplayText] = useState();
  const [gameStateId, setGameStateId] = useState();
  const [gameStateErrorMessage, setGameStateErrorMessage] = useState("");
  const roundNumberRef = useRef();

  const onStartGameStateChange = (startGameState) => {
    setStartGameState(startGameState);
  };

  const onCancel = () => {
    setStartGameState("");
  };

  const onCreateGame = (gameOptions) => {
    postGameState(gameOptions, (gameState) => {
      if (gameState) {
        setGameStateId(gameState.gameStateId);
      } else {
        setGameStateErrorMessage("There was a problem creating the game. Please try again later.");
      }
    });
  };

  const onJoinGame = (gameStateId) => {
    setGameStateId(gameStateId);
  };

  const onGameStateLoadError = useCallback(() => {
    setGameStateId("");
    setGameStateErrorMessage("Did not find a game with that code. Check the game code and try again.");
  }, []);

  const { queryString, setQueryString } = useSignalRConnection();

  const { gameState } = useGameState(gameStateId, onGameStateLoadError);
  const { players } = usePlayers(gameStateId);
  useGameboardPing(gameStateId);

  useEffect(() => {
    if (!gameState || !gameStateId) {
      return;
    }

    if (!queryString) {
      setQueryString("gameStateId=" + gameStateId);
    }
  }, [gameStateId, gameState, queryString, setQueryString]);

  const handlGameStateLoadErrorClose = () => setGameStateErrorMessage("");

  useEffect(() => {
    if (!gameState) {
      return;
    }

    setStartGameState("Playing");

    if (gameState.turnType !== "Welcome" && gameState.turnType !== "EndGame") {
      setGameStateIdDisplay(true);
      if (gameState.revealedPanels.length === 0) {
        setGameStateIdDisplayText("Join the game!\u00A0\u00A0\u00A0picturepanels.net\u00A0\u00A0\u00A0" + gameState.gameStateId);
      } else {
        setGameStateIdDisplayText(gameState.gameStateId);
      }
    } else {
      setGameStateIdDisplay(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (!gameState) {
      return;
    }

    if (gameState.turnType === "Welcome") {
      setUploadedByDisplay(false);
      setAnswerDisplay(false);
      return;
    }

    if (
      gameState.roundNumber === roundNumberRef.current &&
      gameState.turnType !== "EndRound" &&
      gameState.turnType !== "EndGame" &&
      !(gameState.turnType === "GuessesMade" && (gameState.teamOneCorrect || gameState.teamTwoCorrect))
    ) {
      return;
    }

    setRoundNumberAnimateDisplay(true);
    setTimeout(() => {
      setRoundNumberAnimateDisplay(false);
    }, 4000);

    roundNumberRef.current = gameState.roundNumber;
    setRoundNumberAnimateDisplayText("Round " + gameState.roundNumber);

    getImageEntity(gameState.gameStateId, (imageEntity) => {
      if (!imageEntity) {
        setUploadedByDisplay(false);
        setAnswerDisplay(false);
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
  }, [gameState]);

  return (
    <>
      <Modal show={gameStateErrorMessage !== ""} centered onHide={handlGameStateLoadErrorClose}>
        <Modal.Body>{gameStateErrorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handlGameStateLoadErrorClose}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
      {startGameState !== "Playing" && (
        <StartGame
          startGameState={startGameState}
          onStartGameStateChange={onStartGameStateChange}
          onCreateGame={onCreateGame}
          onJoinGame={onJoinGame}
          onCancel={onCancel}
        ></StartGame>
      )}
      {gameState && gameState.turnType === "Welcome" && <Welcome gameStateId={gameStateId}></Welcome>}
      <TeamInfos gameState={gameState ?? {}} />
      <Players players={players} turnType={gameState ? gameState.turnType : ""}></Players>
      {gameState && gameState.turnType !== "Welcome" && gameState.turnType !== "EndGame" && (
        <RoundNumber roundNumber={gameState.roundNumber} finalRoundNumber={gameState.finalRoundNumber}></RoundNumber>
      )}
      <Panels
        gameStateId={gameStateId}
        players={players}
        roundNumber={gameState ? gameState.roundNumber : 0}
        revealedPanels={gameState ? gameState.revealedPanels : []}
        teamTurn={gameState ? gameState.teamTurn : 1}
        turnType={gameState ? gameState.turnType : "Welcome"}
        teamIsCorrect={gameState ? gameState.teamOneCorrect || gameState.teamTwoCorrect : false}
      />
      <FadedBox
        displayState={roundNumberAnimateDisplay}
        className="roundNumberAnimateFadedBox"
        entranceClassName=" animate__bounceInLeft"
        exitClassName="animate__bounceOutRight"
      >
        {roundNumberAnimateDisplayText}
      </FadedBox>
      <FadedBox
        displayState={gameStateIdDisplay}
        className="gameStateIdFadedBox"
        entranceClassName=" animate__bounceInLeft"
        exitClassName="animate__bounceOutLeft"
      >
        {gameStateIdDisplayText}
      </FadedBox>
      <FadedBox
        displayState={uploadedByDisplay}
        className="uploadedByFadedBox"
        entranceClassName=" animate__bounceInRight"
        exitClassName="animate__bounceOutRight"
      >
        {uploadedByDisplayText}
      </FadedBox>
      <FadedBox
        displayState={answerDisplay}
        className="answerFadedBox"
        entranceClassName=" animate__bounceInTop"
        exitClassName="animate__bounceOutTop"
      >
        {answerDisplayText}
      </FadedBox>
    </>
  );
}
