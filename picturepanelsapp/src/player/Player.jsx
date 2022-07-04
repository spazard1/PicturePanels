import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import getGameState from "../common/getGameState";
import PanelButtons from "./PanelButtons";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import StartGame from "./startGame/StartGame";
import ChooseTeam from "./startGame/ChooseTeam";
import JoinGame from "./startGame/JoinGame";
import ChoosePlayerAvatar from "./startGame/ChoosePlayerAvatar";
import ModalMessage from "../common/modal/ModalMessage";
import MakeGuess from "./makeGuess/MakeGuess";
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
import VoteGuess from "./voteGuess/VoteGuess";
import putPlayerResume from "./putPlayerResume";
import Color from "color";
import { useQueryString } from "../common/useQueryString";
import BackgroundAvatar from "./BackgroundAvatar";

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
  const [teamNumber, setTeamNumber] = useState(0);
  const [avatar, setAvatar] = useState();
  const { gameState, gameStateId, setGameState } = useGameState();
  const [turnType, setTurnType] = useState();
  const [teamTurn, setTeamTurn] = useState();
  const [roundNumber, setRoundNumber] = useState();
  const [teamGuessStatus, setTeamGuessStatus] = useState();
  const [hideRemainingTime, setHideRemainingTime] = useLocalStorageState("hideRemainingTime");
  const [disableVibrate, setDisableVibrate] = useLocalStorageState("disableVibrate");
  const [innerPanelCountNotify, setInnerPanelCountNotify] = useLocalStorageState("innerPanelCountNotify");
  const [cachedGameStateId, setCachedGameStateId] = useState(localStorage.getItem("gameStateId"));
  const [teamNameToast, setTeamNameToast] = useState("");
  const { isWinner } = useWinningTeam(gameState, teamNumber);
  const isFirstLoad = useRef(true);
  const [colors, setColors] = useState([]);

  const { vibrate } = usePlayerVibrate();
  usePlayerPing(gameStateId, player);

  const gc = useQueryString("gc");

  useEffect(() => {
    if (gc && gc.length === 4) {
      localStorage.setItem("gameStateId", gc);
      window.location.href = "https://picturepanels.net/";
    }
  }, [gc]);

  const throttledColorChange = useCallback((c, index) => {
    //throttle(100, (c, index) => {

    c.v = Math.max(35, c.v);
    const color = Color(c);

    setColors((cs) => {
      const newColors = [...cs];
      newColors[index] = color;
      return newColors;
    });
    //}),
  }, []);

  const onColorChange = useCallback(
    (c, index) => {
      throttledColorChange(c, index);
    },
    [throttledColorChange]
  );

  const onColorRemove = useCallback(() => {
    setColors((cs) => {
      return cs.slice(0, 1);
    });
  }, []);

  const onJoinGame = (gameOptions) => {
    if (gameOptions.gameStateId.length < 4) {
      setModalMessage("Did not find a game with that code. Check the game code and try again.");
      return;
    }

    setIsLoading(true);

    if (gameOptions.gameStateId !== gameStateId) {
      setPlayer(null);
      setTeamNumber(0);
      setAvatar(null);
      setColors([]);
      localStorage.removeItem("playerId");
    }

    getGameState(gameOptions.gameStateId.toUpperCase(), (gs) => {
      setIsLoading(false);
      if (gs) {
        setGameState(gs);
        setCachedGameStateId(gs.gameStateId);
      } else {
        setModalMessage("Did not find a game with that code. Check the game code and try again.");
      }
    });

    localStorage.setItem("playerName", gameOptions.playerName);
  };

  const onPlayerNameChange = () => {
    setGameState(null);
    setPlayer(null);
  };

  const onPlayerAvatarChange = () => {
    setAvatar(null);
    setPlayer(null);
  };

  const onTeamChange = () => {
    setTeamNumber(0);
    setPlayer(null);
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

  const onAvatarSelect = (avatar) => {
    setAvatar(avatar);
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

  const tryResumeGame = useCallback(
    (gameStateId, playerId) => {
      let playerPromise = getPlayer(gameStateId, playerId, (p) => {
        resumeGameRef.current.player = p;
      });
      let gameStatePromise = getGameState(gameStateId, (gs) => {
        resumeGameRef.current.gameState = gs;
      });

      Promise.all([playerPromise, gameStatePromise])
        .then(() => {
          if (resumeGameRef.current.gameState && resumeGameRef.current.gameState.turnType === "EndGame") {
            localStorage.removeItem("gameStateId");
            setCachedGameStateId("");
            return;
          }

          if (resumeGameRef.current.player && resumeGameRef.current.gameState) {
            setGameState(resumeGameRef.current.gameState);
            setPlayer(resumeGameRef.current.player);
            setTeamNumber(resumeGameRef.current.player.teamNumber);
            setAvatar(resumeGameRef.current.player.avatar);
            if (resumeGameRef.current.player.colors) {
              setColors(resumeGameRef.current.player.colors.map((c) => Color(c)));
            }
            putPlayerResume(resumeGameRef.current.player.gameStateId, resumeGameRef.current.player.playerId);
          }
        })
        .finally(() => {
          setIsResuming(false);
        });
    },
    [setGameState]
  );

  useEffect(() => {
    if (localStorage.getItem("gameStateId") && localStorage.getItem("playerId")) {
      tryResumeGame(localStorage.getItem("gameStateId"), localStorage.getItem("playerId"));
    } else {
      setIsResuming(false);
    }
  }, [tryResumeGame]);

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

  const onSaveGuess = (guess) => {
    setPlayer((p) => {
      if (!p) {
        return;
      }
      if (guess && p.previousGuesses.indexOf(guess) < 0) {
        p.previousGuesses = [...p.previousGuesses, guess];
      }
      return { ...p, isReady: true };
    });
  };

  const setPlayerReady = (isReady) => {
    setPlayer((p) => {
      if (!p) {
        return;
      }
      return { ...p, isReady: isReady };
    });
  };

  const onSelectedPanels = (selectedPanels) => {
    setPlayer((p) => {
      if (!p) {
        return;
      }
      return { ...p, selectedPanels: selectedPanels };
    });
  };

  useEffect(() => {
    if (!gameState) {
      return;
    }

    setTurnType(gameState.turnType);
    setTeamTurn(gameState.teamTurn);
    setRoundNumber(gameState.roundNumber);

    if (teamNumber === 1) {
      setTeamGuessStatus(gameState.teamOneGuessStatus);
    } else {
      setTeamGuessStatus(gameState.teamTwoGuessStatus);
    }
  }, [gameState, teamNumber]);

  useEffect(() => {
    if (turnType) {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }
      setPlayer((p) => {
        if (!p) {
          return;
        }

        return { ...p, isReady: false, selectedPanels: [] };
      });
    }
  }, [turnType]);

  useEffect(() => {
    setPlayer((p) => {
      if (!p) {
        return;
      }

      return { ...p, previousGuesses: [] };
    });
  }, [roundNumber]);

  useEffect(() => {
    if (player) {
      setPlayerId(player.playerId);
    }
  }, [player]);

  useEffect(() => {
    if (disableVibrate) {
      return;
    }

    if (
      (turnType === "OpenPanel" && teamTurn === teamNumber) ||
      turnType === "MakeGuess" ||
      (turnType === "VoteGuess" && teamGuessStatus !== "Skip")
    ) {
      vibrate(25);
    }
  }, [vibrate, disableVibrate, teamNumber, turnType, teamTurn, teamGuessStatus]);

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
    if (!gameStateId || !gameState || !teamNumber || !avatar || player) {
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    putPlayer(
      gameStateId,
      {
        PlayerId: localStorage.getItem("playerId"),
        Name: localStorage.getItem("playerName"),
        TeamNumber: teamNumber,
        Colors: colors.map((c) => c.hex()),
        Avatar: avatar,
      },
      (p) => {
        setIsLoading(false);

        if (p) {
          setPlayer(p);
          localStorage.setItem("playerId", p.playerId);
        } else {
          setModalMessage("Could not join the game. Refresh the page and try again.");
        }
      }
    );
  }, [gameStateId, gameState, teamNumber, colors, avatar, player, setModalMessage, isLoading]);

  useEffect(() => {
    if (!gameState || !gameStateId || !player || queryString) {
      return;
    }

    setQueryString("gameStateId=" + gameStateId + "&playerId=" + player.playerId);
  }, [gameStateId, gameState, queryString, player, setQueryString]);

  if (isResuming) {
    return null;
  }

  return (
    <div className="playerContainer">
      <ModalMessage modalMessage={modalMessage} onModalClose={onModalClose}></ModalMessage>
      <SignalRConnectionStatus></SignalRConnectionStatus>

      {!gameState && <JoinGame isLoading={isLoading} onJoinGame={onJoinGame} cachedGameStateId={cachedGameStateId}></JoinGame>}

      <ChoosePlayerAvatar
        gameState={gameState}
        avatar={avatar}
        colors={colors}
        onColorChange={onColorChange}
        onColorRemove={onColorRemove}
        onAvatarSelect={onAvatarSelect}
      ></ChoosePlayerAvatar>

      {gameState && avatar && teamNumber <= 0 && (
        <ChooseTeam
          gameStateId={gameState.gameStateId}
          teamOneName={gameState.teamOneName}
          teamTwoName={gameState.teamTwoName}
          onTeamNumberSelect={onTeamNumberSelect}
        ></ChooseTeam>
      )}

      {gameState && teamNumber > 0 && player && (
        <>
          <BackgroundAvatar
            name={player.name}
            teamName={teamNumber === 1 ? gameState.teamOneName : gameState.teamTwoName}
            avatar={player.avatar}
            colors={player.colors.map((c) => Color(c))}
          />

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
                ((gameState.turnType === "MakeGuess" || gameState.turnType === "VoteGuess") && !player.isReady))
            }
            isPaused={gameState.pauseState === "Paused"}
            turnTime={gameState.turnTime}
            turnTimeRemaining={gameState.turnTimeRemaining}
          ></LineCountdown>

          <SettingsDropDown
            gameStateId={gameState.gameStateId}
            pauseState={gameState.pauseState}
            hideRemainingTime={hideRemainingTime}
            disableVibrate={disableVibrate}
            onPlayerNameChange={onPlayerNameChange}
            onPlayerAvatarChange={onPlayerAvatarChange}
            onTeamChange={onTeamChange}
            onToggleHideRemainingTime={onToggleHideRemainingTime}
            onToggleVibrate={onToggleVibrate}
          ></SettingsDropDown>

          {gameState.turnType === "OpenPanel" && gameState.teamTurn === teamNumber && !player.isReady && (
            <>
              <PanelButtons
                gameStateId={gameState.gameStateId}
                player={player}
                revealedPanels={gameState.revealedPanels}
                roundNumber={gameState.roundNumber}
                isPaused={gameState.pauseState === "Paused"}
                onSelectedPanels={onSelectedPanels}
              ></PanelButtons>
              <div>
                <Button className="panelButtonsVoteButton" variant="primary" size="lg" disabled={isLoading} onClick={openPanelVoteOnClick}>
                  {isLoading ? "Voting..." : "Vote!"}
                </Button>
              </div>
            </>
          )}

          {gameState.turnType === "MakeGuess" && !player.isReady && (
            <MakeGuess gameStateId={gameStateId} playerId={playerId} previousGuesses={player.previousGuesses} onSaveGuess={onSaveGuess}></MakeGuess>
          )}

          <VoteGuess
            isVisible={gameState.turnType === "VoteGuess" && !player.isReady}
            gameStateId={gameStateId}
            playerId={playerId}
            onVoteGuess={() => setPlayerReady(true)}
          ></VoteGuess>
        </>
      )}
    </div>
  );
}
