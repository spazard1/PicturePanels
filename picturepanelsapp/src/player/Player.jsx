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
import colorConvert from "color-convert";

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
  const [avatar, setAvatar] = useState(localStorage.getItem("playerAvatar"));
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

  const { vibrate } = usePlayerVibrate();
  usePlayerPing(gameStateId, player);

  const [colors, setColors] = useState([]);

  useEffect(() => {
    let initialColors;
    if (localStorage.getItem("playerColors")) {
      try {
        initialColors = JSON.parse(localStorage.getItem("playerColors"));
      } catch (e) {
        initialColors = [];
      }
    } else {
      initialColors = [];
    }
    setColors(initialColors);
  }, []);

  const onColorChange = useCallback((c, index) => {
    c.v = Math.max(35, c.v);
    const hex = "#" + colorConvert.hsv.hex([c.h, c.s, c.v]);

    setColors((cs) => {
      const newColors = [...cs];
      newColors[index] = hex;
      return newColors;
    });
  }, []);

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

    getGameState(gameOptions.gameStateId.toUpperCase(), (gs) => {
      setIsLoading(false);
      if (gs) {
        setGameState(gs);
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
    localStorage.setItem("playerColors", JSON.stringify(colors));
    localStorage.setItem("playerAvatar", avatar);
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
      if (resumeGameRef.current.player.colors) {
        setColors(resumeGameRef.current.player.colors);
      }
      setIsResuming(false);
      putPlayerResume(resumeGameRef.current.player.gameStateId, resumeGameRef.current.player.playerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setPlayerReady(false);
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
    if (!gameStateId || !gameState || !teamNumber || !avatar || player) {
      return;
    }

    putPlayer(
      gameStateId,
      {
        PlayerId: localStorage.getItem("playerId"),
        Name: localStorage.getItem("playerName"),
        TeamNumber: teamNumber,
        Colors: colors,
        Avatar: avatar,
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
  }, [gameStateId, gameState, teamNumber, colors, avatar, player, setModalMessage]);

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
    <>
      <ModalMessage modalMessage={modalMessage} onModalClose={onModalClose}></ModalMessage>
      <SignalRConnectionStatus></SignalRConnectionStatus>

      {!gameState && <JoinGame isLoading={isLoading} onJoinGame={onJoinGame} cachedGameStateId={cachedGameStateId}></JoinGame>}

      {gameState && !avatar && (
        <ChoosePlayerAvatar
          colors={colors}
          onColorChange={onColorChange}
          onColorRemove={onColorRemove}
          onAvatarSelect={onAvatarSelect}
        ></ChoosePlayerAvatar>
      )}

      {gameState && avatar && teamNumber <= 0 && (
        <ChooseTeam
          gameStateId={gameState.gameStateId}
          teamOneName={gameState.teamOneName}
          teamTwoName={gameState.teamTwoName}
          onTeamNumberSelect={onTeamNumberSelect}
        ></ChooseTeam>
      )}

      {gameState && teamNumber > 0 && player && (
        <div className="playingContainer">
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
        </div>
      )}
    </>
  );
}
