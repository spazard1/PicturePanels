import React, { useEffect, useRef, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import { usePlayers } from "../common/usePlayers";
import Panels from "./panels/Panels";
import TeamInfos from "./teaminfos/TeamInfos";
import Players from "./Players";
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
  const roundNumberRef = useRef();
  const { gameState, gameStateId, setGameState } = useGameState();
  const [turnType, setTurnType] = useState();
  const [teamTurn, setTeamTurn] = useState();
  const { winningTeam } = useWinningTeam(gameState);

  const onStartGame = (gameState) => {
    setGameState(gameState);
  };

  const { queryString, setQueryString } = useSignalRConnection();
  const { players } = usePlayers(gameStateId, turnType, teamTurn);
  useGameboardPing(gameStateId);

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
  }, [gameState]);

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
    }, 7000);
  }, [gameState]);

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

      {gameState && <SettingsDropDown gameStateId={gameState.gameStateId} pauseState={gameState.pauseState} />}

      {gameState && gameState.turnType === "Welcome" && <Welcome gameStateId={gameStateId}></Welcome>}

      <TeamInfos gameState={gameState ?? {}} />

      {gameState && (
        <TeamGuesses
          gameStateId={gameState.gameStateId}
          teamOneGuess={gameState.teamOneGuess}
          teamOneGuessStatus={gameState.teamOneGuessStatus}
          teamOneCorrect={gameState.TeamOneCorrect}
          teamTwoGuess={gameState.teamTwoGuess}
          teamTwoGuessStatus={gameState.teamTwoGuessStatus}
          teamTwoCorrect={gameState.TeamTwoCorrect}
          turnType={gameState.turnType}
        />
      )}

      <Players players={players} turnType={gameState ? gameState.turnType : ""} />
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
