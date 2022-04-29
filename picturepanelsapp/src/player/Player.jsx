import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import getGameState from "../common/getGameState";
import Chat from "./Chat";
import PanelButtons from "./PanelButtons";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import TeamGuesses from "./teamGuesses/TeamGuesses";
import StartGameButtons from "./StartGameButtons";
import ChooseTeam from "./ChooseTeam";
import JoinGame from "./JoinGame";
import ModalMessage from "../common/modal/ModalMessage";
import { useModal } from "../common/modal/useModal";
import putPlayer from "./putPlayer";
import { usePlayerPing } from "./usePlayerPing";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import putPlayerOpenPanelVote from "./putPlayerOpenPanelVote";
import getPlayer from "./getPlayer";
import SignalRConnectionStatus from "../signalr/SignalRConnectionStatus";
import SettingsDropDown from "./SettingsDropDown";
import { putTogglePauseGame } from "../common/putTogglePauseGame";
import { usePlayerVibrate } from "./usePlayerVibrate";
import LineCountdown from "./LineCountdown";

import "./Player.css";
import "animate.css";
import "../animate/animate.css";
import { useLocalStorageState } from "../common/useLocalStorageState";

export default function Player() {
  useBodyClass("player");

  const { queryString, setQueryString } = useSignalRConnection();
  const [modalMessage, setModalMessage, onModalClose] = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [player, setPlayer] = useState();
  const [playerId, setPlayerId] = useState();
  const [teamNumber, setTeamNumber] = useState();
  const { gameState, gameStateId, setGameState } = useGameState();
  const [turnType, setTurnType] = useState();
  const [teamTurn, setTeamTurn] = useState();
  const [hideRemainingTime, setHideRemainingTime] = useLocalStorageState("hideRemainingTime");
  const [disableVibrate, setDisableVibrate] = useLocalStorageState("disableVibrate");
  const { vibrate } = usePlayerVibrate();
  usePlayerPing(gameStateId, player);

  let initialColor;
  if (localStorage.getItem("playerColor")) {
    initialColor = localStorage.getItem("playerColor");
  } else {
    initialColor = "hsl(" + Math.ceil(Math.random() * 360) + ", 100%, 50%)";
  }
  const [color, setColor] = useState(initialColor);

  const onColorChange = useCallback((c) => {
    setColor(c);
  }, []);

  const onJoinGame = (gameOptions) => {
    if (gameOptions.gameStateId.length < 4) {
      setModalMessage("Did not find a game with that code. Check the game code and try again.");
      return;
    }

    setIsLoading(true);

    getGameState(gameOptions.gameStateId.toUpperCase(), (gs) => {
      setIsLoading(false);
      if (gs) {
        setGameState(gs);
      } else {
        setModalMessage("Did not find a game with that code. Check the game code and try again.");
      }
    });

    localStorage.setItem("playerName", gameOptions.playerName);
    localStorage.setItem("playerColor", color);
  };

  const onPlayerNameChange = () => {
    setGameState(null);
    setPlayer(null);
  };

  const onTeamChange = () => {
    setPlayer(null);
    setTeamNumber(0);
  };

  const onTogglePauseGame = () => {
    putTogglePauseGame(gameStateId, () => {});
  };

  const onTeamNumberSelect = (teamNumber) => {
    if (!teamNumber) {
      setModalMessage("Could not join the game. Refresh the page and try again.");
    } else {
      setTeamNumber(teamNumber);
    }
  };

  const openPanelVoteOnClick = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    putPlayerOpenPanelVote(gameStateId, player.playerId, (p) => {
      setIsLoading(false);
      if (!p) {
        setModalMessage("Could not send your vote. Refresh the page and try again.");
      } else {
        setPlayer(p);
      }
    });
  };

  const resumeGameRef = useRef({});
  const [isResuming, setIsResuming] = useState(true);

  const tryResumeGame = useCallback(() => {
    if (resumeGameRef.current.player && resumeGameRef.current.gameState && !resumeGameRef.current.isResumed) {
      resumeGameRef.current.isResumed = true;
      setGameState(resumeGameRef.current.gameState);
      setPlayer(resumeGameRef.current.player);
      setTeamNumber(resumeGameRef.current.player.teamNumber);
      setIsResuming(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTeamGuessVote = (ticks) => {
    if (player.teamGuessVote === ticks) {
      setPlayer({ ...player, ["teamGuessVote"]: "" });
    } else {
      setPlayer({ ...player, ["teamGuessVote"]: ticks });
    }
  };

  const onToggleHideRemainingTime = () => {
    if (hideRemainingTime) {
      setHideRemainingTime();
    } else {
      setHideRemainingTime("true");
    }
  };

  const onToggleVibrate = () => {
    if (disableVibrate) {
      setDisableVibrate();
    } else {
      setDisableVibrate("true");
    }
  };

  useEffect(() => {
    if (gameState && gameState.turnType) {
      setTurnType(gameState.turnType);
    }
    if (gameState && gameState.teamTurn) {
      setTeamTurn(gameState.teamTurn);
    }
  }, [gameState]);

  useEffect(() => {
    if (turnType) {
      setPlayer((p) => {
        return { ...p, ["isReady"]: false };
      });
    }
  }, [turnType]);

  useEffect(() => {
    if (player) {
      setPlayerId(player.playerId);
    }
  }, [player]);

  useEffect(() => {
    if ((!disableVibrate && turnType === "OpenPanel" && teamTurn === teamNumber) || turnType === "MakeGuess") {
      vibrate(25);
    }
  }, [vibrate, disableVibrate, teamNumber, turnType, teamTurn]);

  useEffect(() => {
    if (!localStorage.getItem("gameStateId") || !localStorage.getItem("playerId")) {
      setIsResuming(false);
      return;
    }

    getPlayer(localStorage.getItem("gameStateId"), localStorage.getItem("playerId"), (p) => {
      if (p) {
        resumeGameRef.current.player = p;
      } else {
        setIsResuming(false);
        return;
      }
      tryResumeGame();
    });
    getGameState(localStorage.getItem("gameStateId"), (gs) => {
      if (gs) {
        resumeGameRef.current.gameState = gs;
      } else {
        setIsResuming(false);
        return;
      }
      tryResumeGame();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!gameStateId || !gameState || !teamNumber || player) {
      return;
    }

    putPlayer(
      gameStateId,
      {
        PlayerId: localStorage.getItem("playerId"),
        Name: localStorage.getItem("playerName"),
        TeamNumber: teamNumber,
        Color: color,
      },
      (p) => {
        if (p) {
          setPlayer(p);
          localStorage.setItem("playerId", p.playerId);
        } else {
          setModalMessage("Could not join the game. Refresh the page and try again.");
        }
      }
    );
  }, [gameStateId, gameState, teamNumber, color, player, setModalMessage]);

  useEffect(() => {
    if (!gameState || !gameStateId || !player || queryString) {
      return;
    }

    setQueryString("gameStateId=" + gameStateId + "&playerId=" + player.playerId);
  }, [gameStateId, gameState, queryString, player, setQueryString]);

  if (isResuming) {
    return <></>;
  }

  return (
    <div className="main center">
      <ModalMessage modalMessage={modalMessage} onModalClose={onModalClose}></ModalMessage>
      <SignalRConnectionStatus></SignalRConnectionStatus>

      {!gameState && <JoinGame color={color} isLoading={isLoading} onJoinGame={onJoinGame} onColorChange={onColorChange}></JoinGame>}

      {gameState && !teamNumber && (
        <ChooseTeam
          gameStateId={gameState.gameStateId}
          teamOneName={gameState.teamOneName}
          teamTwoName={gameState.teamTwoName}
          onTeamNumberSelect={onTeamNumberSelect}
        ></ChooseTeam>
      )}

      {gameState && player && teamNumber && (
        <>
          {gameState.turnType === "Welcome" && <StartGameButtons turnEndTime={gameState.turnEndTime}></StartGameButtons>}

          <SettingsDropDown
            pauseState={gameState.pauseState}
            hideRemainingTime={hideRemainingTime}
            disableVibrate={disableVibrate}
            onPlayerNameChange={onPlayerNameChange}
            onTeamChange={onTeamChange}
            onTogglePauseGame={onTogglePauseGame}
            onToggleHideRemainingTime={onToggleHideRemainingTime}
            onToggleVibrate={onToggleVibrate}
          ></SettingsDropDown>
          <LineCountdown
            isCountdownActive={
              !hideRemainingTime &&
              ((gameState.turnType === "OpenPanel" && gameState.teamTurn === teamNumber) ||
                (gameState.turnType === "MakeGuess" && !gameState.teamOneGuessStatus))
            }
            isPaused={gameState.pauseState === "Paused"}
            turnTime={gameState.turnTime}
            turnTimeTotal={gameState.turnTimeTotal}
            turnTimeRemaining={gameState.turnTimeRemaining}
            pauseTurnRemainingTime={gameState.pauseTurnRemainingTime}
          ></LineCountdown>

          <Alert className="pauseAlert" show={gameState && gameState.pauseState === "Paused"} variant="success">
            Game is paused
          </Alert>

          {gameState.turnType === "OpenPanel" && gameState.teamTurn === teamNumber && !player.isReady && (
            <>
              <PanelButtons
                gameStateId={gameState.gameStateId}
                playerId={player.playerId}
                revealedPanels={gameState.revealedPanels}
                roundNumber={gameState.roundNumber}
              ></PanelButtons>
              {gameState.pauseState !== "Paused" && (
                <Button className="panelButtonsVoteButton" variant="primary" size="lg" disabled={isLoading} onClick={openPanelVoteOnClick}>
                  {isLoading ? "Voting..." : "Vote!"}
                </Button>
              )}
            </>
          )}

          <TeamGuesses
            turnType={gameState.turnType}
            roundNumber={gameState.roundNumber}
            gameStateId={gameState.gameStateId}
            playerId={playerId}
            teamGuessVote={player.teamGuessVote}
            teamNumber={teamNumber}
            onTeamGuessVote={onTeamGuessVote}
          ></TeamGuesses>

          <Chat></Chat>
        </>
      )}
    </div>
  );
}
