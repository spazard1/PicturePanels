import React, { useCallback, useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import { usePlayers } from "../common/usePlayers";
import Panels from "./panels/Panels";
import TeamInfos from "./teaminfos/TeamInfos";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import FadedBox from "./FadedBox";
import { getImageEntity } from "./getImageEntity";
import { useGameboardPing } from "./useGameboardPing";
import StartGame from "./startGame/StartGame";
import Welcome from "./Welcome";
import SettingsDropDown from "./SettingsDropDown";
import RoundNumber from "./RoundNumber";
import EndGame from "./EndGame";
import SignalRConnectionStatus from "../signalr/SignalRConnectionStatus";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { useWinningTeam } from "../common/useWinningTeam";
import classNames from "classnames";
import TeamGuesses from "./TeamGuesses";
import { useLocalStorageState } from "../common/useLocalStorageState";
import { useThemeSounds } from "./useThemeSounds";
import { useSignalR } from "../signalr/useSignalR";
import useTimeRemaining from "../common/useTimeRemaining";

import "./Gameboard.css";
import "animate.css";
import "../animate/animate.css";

export default function Gameboard() {
  useBodyClass("gameboard");

  const [roundNumberAnimateDisplay, setRoundNumberAnimateDisplay] = useState(false);
  const [roundNumberAnimateDisplayText, setRoundNumberAnimateDisplayText] = useState();
  const [gameStateIdDisplay, setGameStateIdDisplay] = useState(false);
  const [gameStateIdDisplayText, setGameStateIdDisplayText] = useState();
  const [uploadedByDisplay, setUploadedByDisplay] = useState(false);
  const [uploadedByDisplayText, setUploadedByDisplayText] = useState();
  const [answerDisplay, setAnswerDisplay] = useState(false);
  const [answerDisplayText, setAnswerDisplayText] = useState();
  const [timeRemainingDisplay, setTimeRemainingDisplay] = useState(false);
  const [timeRemainingDisplayText, setTimeRemainingDisplayText] = useState();
  const [roundNumber, setRoundNumber] = useState();
  const { gameState, gameStateId, setGameState } = useGameState();
  const [turnType, setTurnType] = useState();
  const [teamTurn, setTeamTurn] = useState();
  const { winningTeam } = useWinningTeam(gameState);
  const [volume, setVolume] = useLocalStorageState("volume", 50);

  const onChangeVolume = useCallback(
    (v) => {
      setVolume(v);
    },
    [setVolume]
  );

  const {
    playPlayerJoinSound,
    playTurnStartSound,
    playCountdownSound,
    playOpenPanelSound,
    //playPlayerReadySound,
    playBothTeamsPassSound,
    playCorrectSound,
    playIncorrectSound,
    playEndGameSound,
  } = useThemeSounds(gameStateId, volume);

  const onStartGame = (gameState) => {
    setGameState(gameState);
  };

  const timeRemaining = useTimeRemaining(gameState?.pauseState === "Paused", gameState?.turnTime, gameState?.turnTimeRemaining, 1);

  const { queryString, setQueryString } = useSignalRConnection();
  const { players } = usePlayers(turnType, teamTurn, playPlayerJoinSound);
  useGameboardPing(gameStateId);

  useSignalR("OpenPanel", () => {
    playOpenPanelSound();
  });

  useEffect(() => {
    if (!gameState || queryString) {
      return;
    }

    setQueryString("gameStateId=" + gameState.gameStateId);
  }, [gameState, queryString, setQueryString]);

  useEffect(() => {
    if (!gameState) {
      return;
    }

    setTurnType(gameState.turnType);
    setTeamTurn(gameState.teamTurn);
    if (gameState.turnType !== "Welcome" && gameState.turnType !== "EndGame") {
      setRoundNumber(gameState.roundNumber);
    }
  }, [gameState]);

  useEffect(() => {
    if (turnType === "OpenPanel") {
      playTurnStartSound();
    } else if (turnType === "EndGame") {
      playEndGameSound();
    }
  }, [turnType, playTurnStartSound, playEndGameSound]);

  useEffect(() => {
    if (!gameState) {
      return;
    }

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
    if (!turnType || !gameStateId) {
      return;
    }

    if (turnType !== "EndRound") {
      setAnswerDisplay(false);
      return;
    }

    getImageEntity(gameStateId, (imageEntity) => {
      if (!imageEntity || !imageEntity.name) {
        setAnswerDisplay(false);
        return;
      }

      setAnswerDisplay(true);
      setAnswerDisplayText(imageEntity.name);
    });
  }, [turnType, gameStateId]);

  useEffect(() => {
    if (!roundNumber || !gameStateId) {
      return;
    }

    getImageEntity(gameStateId, (imageEntity) => {
      if (!imageEntity || !imageEntity.uploadedBy) {
        setUploadedByDisplay(false);
        return;
      }

      setUploadedByDisplay(true);
      setUploadedByDisplayText("Uploaded by: " + imageEntity.uploadedBy);
    });
  }, [roundNumber, gameStateId]);

  useEffect(() => {
    if (!turnType) {
      return;
    }

    if (turnType === "Welcome" || turnType === "EndGame") {
      setUploadedByDisplay(false);
      return;
    }
  }, [turnType]);

  useEffect(() => {
    if (!roundNumber) {
      return;
    }

    setRoundNumberAnimateDisplayText("Round " + roundNumber);

    setRoundNumberAnimateDisplay(true);
    setTimeout(() => {
      setRoundNumberAnimateDisplay(false);
    }, 7000);
  }, [roundNumber]);

  useEffect(() => {
    if (!gameState) {
      return;
    }

    if (gameState.pauseState === "Paused") {
      setTimeRemainingDisplay(false);
      return;
    }

    if (gameState.turnType === "Welcome" && timeRemaining?.millisecondsRemaining > 0) {
      setTimeRemainingDisplay(true);
      setTimeRemainingDisplayText(
        "Game starts in: " + (timeRemaining?.millisecondsRemaining ? Math.ceil(timeRemaining?.millisecondsRemaining / 1000) : "--")
      );

      playCountdownSound();
      return;
    }

    if (gameState.turnType === "EndRound" || (gameState.turnType === "GuessesMade" && (gameState.teamOneCorrect || gameState.teamTwoCorrect))) {
      if (!timeRemaining?.millisecondsRemaining || timeRemaining?.millisecondsRemaining > 10000) {
        setTimeRemainingDisplay(false);
        return;
      }
      setTimeRemainingDisplay(true);

      if (gameState.roundNumber === gameState.finalRoundNumber) {
        setTimeRemainingDisplayText(
          "Game ends in: " + (timeRemaining?.millisecondsRemaining ? Math.floor(timeRemaining?.millisecondsRemaining / 1000) : "--")
        );
      } else {
        setTimeRemainingDisplayText(
          "Next round in: " + (timeRemaining?.millisecondsRemaining ? Math.floor(timeRemaining?.millisecondsRemaining / 1000) : "--")
        );
      }

      return;
    }

    setTimeRemainingDisplay(false);
  }, [timeRemaining, gameState, playCountdownSound]);

  return (
    <>
      <SignalRConnectionStatus />

      {!gameState && <StartGame onStartGame={onStartGame} />}

      {gameState && (
        <ToastContainer position={"middle-center"}>
          <Toast className="pauseToast" show={gameState.pauseState === "Paused"} bg="warning">
            Game is paused
          </Toast>
        </ToastContainer>
      )}

      <SettingsDropDown gameStateId={gameState?.gameStateId} pauseState={gameState?.pauseState} volume={volume} onChangeVolume={onChangeVolume} />

      {gameState && gameState.turnType === "Welcome" && <Welcome gameStateId={gameState?.gameStateId}></Welcome>}

      <TeamInfos gameState={gameState ?? {}} />

      {gameState && (
        <TeamGuesses
          gameStateId={gameState.gameStateId}
          teamOneGuess={gameState.teamOneGuess}
          teamOneGuessStatus={gameState.teamOneGuessStatus}
          teamOneCorrect={gameState.teamOneCorrect}
          teamTwoGuess={gameState.teamTwoGuess}
          teamTwoGuessStatus={gameState.teamTwoGuessStatus}
          teamTwoCorrect={gameState.teamTwoCorrect}
          turnType={gameState.turnType}
          playCorrectSound={playCorrectSound}
          playIncorrectSound={playIncorrectSound}
          playBothTeamsPassSound={playBothTeamsPassSound}
        />
      )}

      {gameState && gameState.turnType !== "Welcome" && gameState.turnType !== "EndGame" && (
        <RoundNumber roundNumber={gameState.roundNumber} finalRoundNumber={gameState.finalRoundNumber} />
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

      {gameState && gameState.turnType === "EndGame" && <EndGame gameStateId={gameState.gameStateId} winningTeamName={winningTeam}></EndGame>}

      <FadedBox
        displayState={timeRemainingDisplay}
        className="remainingTurnTimeFadedBox"
        entranceClassNames="animate__backInUp"
        exitClassNames="animate__backOutDown"
      >
        {timeRemainingDisplayText}
      </FadedBox>

      <FadedBox
        displayState={roundNumberAnimateDisplay}
        className="roundNumberAnimateFadedBox"
        entranceClassNames="animate__backInLeft animate__delay-2s"
        exitClassNames="animate__backOutRight"
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
      {gameState && (
        <FadedBox
          displayState={answerDisplay}
          className="answerFadedBox"
          entranceClassNames={classNames("animate__backInUp", "animate__slow", {
            "animate__delay-2s": gameState.turnType === "EndRound",
            "animate__delay-10s": gameState.turnType === "GuessesMade",
          })}
          exitClassNames="animate__backOutDown"
        >
          {answerDisplayText}
        </FadedBox>
      )}
    </>
  );
}
