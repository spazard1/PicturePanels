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
import StartGame from "./StartGame";
import Welcome from "./Welcome";
import Pause from "./Pause";

import "./Gameboard.css";
import "animate.css";
import "../animate/animate.css";
import postGameState from "../common/postGameState";
import RoundNumber from "./RoundNumber";
import EndGame from "./EndGame";
import { useErrorMessageModal } from "../common/useErrorMessageModal";

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
  const roundNumberRef = useRef();
  const { ErrorMessageModal, setErrorMessage } = useErrorMessageModal();

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
        setErrorMessage("There was a problem creating the game. Please try again later.");
      }
    });
  };

  const onJoinGame = (gameStateId) => {
    setGameStateId(gameStateId);
  };

  const onGameStateLoadError = useCallback(() => {
    setGameStateId("");
    setErrorMessage("Did not find a game with that code. Check the game code and try again.");
  }, [setErrorMessage]);

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

    if (gameState.turnType === "Welcome" || gameState.turnType === "EndGame") {
      setUploadedByDisplay(false);
      setAnswerDisplay(false);
      return;
    }

    if (
      gameState.roundNumber === roundNumberRef.current &&
      gameState.turnType !== "EndRound" &&
      !(gameState.turnType === "GuessesMade" && (gameState.teamOneCorrect || gameState.teamTwoCorrect))
    ) {
      setAnswerDisplay(false);
      return;
    }

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

  useEffect(() => {
    if (!gameState) {
      return;
    }

    if (gameState.roundNumber === roundNumberRef.current || gameState.turnType !== "OpenPanel" || gameState.revealedPanels.length > 0) {
      return;
    }

    roundNumberRef.current = gameState.roundNumber;
    setRoundNumberAnimateDisplayText("Round " + gameState.roundNumber);

    setRoundNumberAnimateDisplay(true);
    setTimeout(() => {
      setRoundNumberAnimateDisplay(false);
    }, 8000);
  }, [gameState]);

  return (
    <>
      <ErrorMessageModal></ErrorMessageModal>
      {gameState && (
        <Pause
          gameStateId={gameState.gameStateId}
          guessTime={gameState.guessTime}
          openPanelTime={gameState.openPanelTime}
          pauseState={gameState.pauseState}
          turnType={gameState.turnType}
        ></Pause>
      )}
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
      {(!gameState || gameState.turnType !== "EndGame") && (
        <Panels
          gameStateId={gameStateId}
          players={players}
          roundNumber={gameState ? gameState.roundNumber : 0}
          revealedPanels={gameState ? gameState.revealedPanels : []}
          teamTurn={gameState ? gameState.teamTurn : 1}
          turnType={gameState ? gameState.turnType : "Welcome"}
          teamIsCorrect={gameState ? gameState.teamOneCorrect || gameState.teamTwoCorrect : false}
        />
      )}
      {gameState && gameState.turnType === "EndGame" && <EndGame gameStateId={gameState.gameStateId}></EndGame>}
      <FadedBox
        displayState={roundNumberAnimateDisplay}
        className="roundNumberAnimateFadedBox"
        entranceClassNames="animate__backInLeft animate__slow animate__delay-2s"
        exitClassNames="animate__backOutRight animate__slow "
      >
        {roundNumberAnimateDisplayText}
      </FadedBox>
      <FadedBox
        displayState={gameStateIdDisplay}
        className="gameStateIdFadedBox"
        entranceClassNames="animate__backInLeft animate__slow"
        exitClassNames="animate__backOutLeft"
      >
        {gameStateIdDisplayText}
      </FadedBox>
      <FadedBox
        displayState={uploadedByDisplay}
        className="uploadedByFadedBox"
        entranceClassNames="animate__backInRight animate__slow"
        exitClassNames="animate__backOutRight"
      >
        {uploadedByDisplayText}
      </FadedBox>
      <FadedBox
        displayState={answerDisplay}
        className="answerFadedBox"
        entranceClassNames="animate__bounceInDown animate__slow animate__delay-7s"
        exitClassNames="animate__bounceOutUp"
      >
        {answerDisplayText}
      </FadedBox>
    </>
  );
}
