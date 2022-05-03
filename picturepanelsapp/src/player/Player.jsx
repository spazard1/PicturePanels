import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import getGameState from "../common/getGameState";
import Chat from "./chat/Chat";
import PanelButtons from "./PanelButtons";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import TeamGuesses from "./teamGuesses/TeamGuesses";
import StartGame from "./startGame/StartGame";
import ChooseTeam from "./startGame/ChooseTeam";
import JoinGame from "./startGame/JoinGame";
import ModalMessage from "../common/modal/ModalMessage";
import { useModal } from "../common/modal/useModal";
import putPlayer from "./putPlayer";
import { usePlayerPing } from "./usePlayerPing";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import putPlayerOpenPanelVote from "./putPlayerOpenPanelVote";
import getPlayer from "./getPlayer";
import SignalRConnectionStatus from "../signalr/SignalRConnectionStatus";
import SettingsDropDown from "./SettingsDropDown";
import { usePlayerVibrate } from "./usePlayerVibrate";
import LineCountdown from "./LineCountdown";
import { useWinningTeam } from "../common/useWinningTeam";
import { useLocalStorageState } from "../common/useLocalStorageState";

import "./Player.css";
import "animate.css";
import "../animate/animate.css";

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
  const [innerPanelCountNotify, setInnerPanelCountNotify] = useLocalStorageState("innerPanelCountNotify");
  const [cachedGameStateId, setCachedGameStateId] = useState(localStorage.getItem("gameStateId"));
  const [teamNameToast, setTeamNameToast] = useState("");
  const { isWinner } = useWinningTeam(gameState, teamNumber);

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

  const onTeamNumberSelect = (teamNumber) => {
    if (!teamNumber) {
      setModalMessage("Could not join the game. Refresh the page and try again.");
    } else {
      setTeamNumber(teamNumber);
      if (teamNumber === 1) {
        setTeamNameToast("You have joined " + gameState.teamOneName);
      } else {
        setTeamNameToast("You have joined " + gameState.teamTwoName);
      }
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
    if (resumeGameRef.current.gameState && resumeGameRef.current.gameState.turnType === "EndGame") {
      localStorage.removeItem("gameStateId");
      setCachedGameStateId("");
      setIsResuming(false);
      return;
    }

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
        if (!p) {
          return;
        }
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
    if (!gameStateId || !gameState) {
      return;
    }

    if (
      innerPanelCountNotify !== gameStateId &&
      turnType === "OpenPanel" &&
      teamTurn === teamNumber &&
      ((teamNumber === 1 && gameState.teamOneInnerPanels <= 0) || (teamNumber === 2 && gameState.teamTwoInnerPanels <= 0))
    ) {
      setInnerPanelCountNotify(gameStateId);
      setModalMessage("Your team is out of inner panels. From now on, if you open an inner panel, it will cost one point.");
    }
  }, [setModalMessage, setInnerPanelCountNotify, gameStateId, innerPanelCountNotify, teamNumber, turnType, teamTurn, gameState]);

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
    <>
      <ModalMessage modalMessage={modalMessage} onModalClose={onModalClose}></ModalMessage>
      <SignalRConnectionStatus></SignalRConnectionStatus>

      {!gameState && (
        <JoinGame
          color={color}
          isLoading={isLoading}
          onJoinGame={onJoinGame}
          onColorChange={onColorChange}
          cachedGameStateId={cachedGameStateId}
        ></JoinGame>
      )}

      {gameState && teamNumber > 0 && (
        <>
          {gameState.turnType === "Welcome" && (
            <StartGame
              gameStateId={gameState.gameStateId}
              playerId={player.playerId}
              turnTime={gameState.turnTime}
              turnTimeRemaining={gameState.turnTimeRemaining}
            ></StartGame>
          )}

          <ToastContainer position={"top-center"}>
            <Toast show={gameState.pauseState === "Paused"} bg="warning">
              <Toast.Body>Game is paused</Toast.Body>
            </Toast>
            <Toast show={gameState.turnType === "EndGame"} bg={isWinner ? "success" : "danger"}>
              <Toast.Body>{isWinner ? "Congratulations! Your team wins!" : "Your team didn't win. Maybe next time..."}</Toast.Body>
            </Toast>
            <Toast onClose={() => setTeamNameToast("")} show={teamNameToast !== ""} delay={6000} autohide bg="info">
              <Toast.Body>{teamNameToast}</Toast.Body>
            </Toast>
          </ToastContainer>
          <LineCountdown
            isCountdownActive={
              player &&
              !hideRemainingTime &&
              ((gameState.turnType === "OpenPanel" && gameState.teamTurn === teamNumber) ||
                (gameState.turnType === "MakeGuess" &&
                  ((teamNumber === 1 && !gameState.teamOneGuessStatus) || (teamNumber === 2 && !gameState.teamTwoGuessStatus))))
            }
            isPaused={gameState.pauseState === "Paused"}
            turnTime={gameState.turnTime}
            turnTimeRemaining={gameState.turnTimeRemaining}
          ></LineCountdown>
        </>
      )}

      {gameState && !teamNumber && (
        <ChooseTeam
          gameStateId={gameState.gameStateId}
          teamOneName={gameState.teamOneName}
          teamTwoName={gameState.teamTwoName}
          onTeamNumberSelect={onTeamNumberSelect}
        ></ChooseTeam>
      )}

      {gameState && player && teamNumber > 0 && (
        <>
          <SettingsDropDown
            gameStateId={gameState.gameStateId}
            pauseState={gameState.pauseState}
            hideRemainingTime={hideRemainingTime}
            disableVibrate={disableVibrate}
            onPlayerNameChange={onPlayerNameChange}
            onTeamChange={onTeamChange}
            onToggleHideRemainingTime={onToggleHideRemainingTime}
            onToggleVibrate={onToggleVibrate}
          ></SettingsDropDown>

          {gameState.turnType === "OpenPanel" && gameState.teamTurn === teamNumber && !player.isReady && (
            <>
              <PanelButtons
                gameStateId={gameState.gameStateId}
                playerId={player.playerId}
                revealedPanels={gameState.revealedPanels}
                roundNumber={gameState.roundNumber}
                isPaused={gameState.pauseState === "Paused"}
              ></PanelButtons>
              <div>
                <Button
                  className="panelButtonsVoteButton"
                  variant="primary"
                  size="lg"
                  disabled={isLoading || gameState.pauseState === "Paused"}
                  onClick={openPanelVoteOnClick}
                >
                  {isLoading ? "Voting..." : "Vote!"}
                </Button>
              </div>
            </>
          )}

          <TeamGuesses
            isPaused={gameState.pauseState === "Paused"}
            hasTeamGuessed={(teamNumber === 1 && gameState.teamOneGuessStatus !== "") || (teamNumber === 2 && gameState.teamTwoGuessStatus !== "")}
            turnType={gameState.turnType}
            roundNumber={gameState.roundNumber}
            gameStateId={gameState.gameStateId}
            playerId={playerId}
            teamGuessVote={player.teamGuessVote}
            teamNumber={teamNumber}
            onTeamGuessVote={onTeamGuessVote}
          ></TeamGuesses>

          <Chat
            gameStateId={gameStateId}
            playerId={player.playerId}
            teamNumber={teamNumber}
            teamName={teamNumber === 1 ? gameState.teamOneName : gameState.teamTwoName}
          ></Chat>
        </>
      )}
    </>
  );
}
