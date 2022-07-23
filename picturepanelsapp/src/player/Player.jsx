import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import getGameState from "../common/getGameState";
import PanelButtons from "./PanelButtons";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import StartGame from "./startGame/StartGame";
import ChooseTeam from "./startGame/ChooseTeam";
import JoinGame from "./startGame/JoinGame";
import ChoosePlayerAvatar from "./startGame/ChoosePlayerAvatar";
import MakeGuess from "./makeGuess/MakeGuess";
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
import ModalContext from "../common/modal/ModalContext";

import "./Player.css";
import "animate.css";
import "../animate/animate.css";

export default function Player() {
  useBodyClass("player");

  const { setModalMessage } = useContext(ModalContext);
  const { queryString, setQueryString } = useSignalRConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [player, setPlayer] = useState();
  const [shouldSavePlayer, setShouldSavePlayer] = useState(false);
  const [playerName, setPlayerName] = useLocalStorageState("playerName");
  const [teamNumber, setTeamNumber] = useState(0);
  const { gameState, gameStateId, setGameState, setGameStateId } = useGameState();
  const [turnType, setTurnType] = useState();
  const [teamTurn, setTeamTurn] = useState();
  const [roundNumber, setRoundNumber] = useState();
  const [teamGuessStatus, setTeamGuessStatus] = useState();
  const [hideRemainingTime, setHideRemainingTime] = useLocalStorageState("hideRemainingTime");
  const [disableVibrate, setDisableVibrate] = useLocalStorageState("disableVibrate");
  const [innerPanelCountNotify, setInnerPanelCountNotify] = useLocalStorageState("innerPanelCountNotify");
  const [cachedGameStateId, setCachedGameStateId] = useLocalStorageState("gameStateId");
  const [teamNameToast, setTeamNameToast] = useState("");
  const { isWinner } = useWinningTeam(gameState, player);
  const isFirstLoad = useRef(true);
  const [colors, setColors] = useState([]);

  const { vibrate } = usePlayerVibrate();
  usePlayerPing(gameState?.gameStateId, player);

  const gc = useQueryString("gc");

  useEffect(() => {
    if (gc && gc.length === 4) {
      localStorage.setItem("gameStateId", gc);
      window.location.href = "https://picturepanels.net/";
    }
  }, [gc]);

  const savePlayer = useCallback(() => {
    putPlayer(
      gameStateId,
      {
        PlayerId: localStorage.getItem("playerId"),
        Name: playerName,
        TeamNumber: player?.teamNumber,
        Colors: colors?.map((c) => c.hex()),
        Avatar: player?.avatar,
      },
      async (p) => {
        if (p.status === 404) {
          setModalMessage("Could not find the game to join. Check your game code and try again.");
          return;
        }

        if (p.status === 409) {
          // conflict
          let responseText = await p.text();
          if (responseText === "name") {
            setModalMessage("Another player is already using that name. Enter a different name.");
            setPlayer();
          } else if (responseText === "avatar") {
            setModalMessage("Another player is already using that avatar. Choose a different avatar.");
            const newPlayer = { ...player };
            delete newPlayer["avatar"];
            setPlayer(newPlayer);
          }
          return;
        }

        if (p) {
          setPlayer(p);
          localStorage.setItem("playerId", p.playerId);
        } else {
          setModalMessage("Could not join the game. Refresh the page and try again.");
          setPlayer();
        }
      }
    );
  }, [player, playerName, colors, gameStateId, setModalMessage]);

  useEffect(() => {
    if (!shouldSavePlayer) {
      return;
    }
    setShouldSavePlayer(false);

    savePlayer();
  }, [shouldSavePlayer, savePlayer]);

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

  const onPlayerNameChange = useCallback(() => {
    setPlayer();
    setGameState();
  }, [setGameState]);

  const onPlayerAvatarChange = useCallback(() => {
    const newPlayer = { ...player };
    delete newPlayer["avatar"];
    setPlayer(newPlayer);
  }, [player]);

  const onTeamChange = useCallback(() => {
    const newPlayer = { ...player };
    newPlayer.teamNumber = 0;
    setPlayer(newPlayer);
  }, [player]);

  const onJoinGame = useCallback(
    (gameOptions) => {
      setPlayerName(gameOptions.playerName);

      if (gameOptions.gameStateId.length < 4) {
        setModalMessage("Did not find a game with that code. Check the game code and try again.");
        return;
      }

      if (gameOptions.gameStateId !== gameStateId) {
        setPlayer();
        setColors([]);
      }

      setCachedGameStateId(gameOptions.gameStateId.toUpperCase());
      setGameStateId(gameOptions.gameStateId.toUpperCase());

      setShouldSavePlayer(true);
    },
    [gameStateId, setCachedGameStateId, setGameStateId, setModalMessage, setPlayerName]
  );

  const onAvatarSelect = useCallback(
    (avatar) => {
      const newPlayer = { ...player };
      newPlayer.avatar = avatar;
      setPlayer(newPlayer);
      setShouldSavePlayer(true);
    },
    [player]
  );

  const onTeamNumberSelect = useCallback(
    (teamNumber) => {
      const newPlayer = { ...player };
      newPlayer.teamNumber = teamNumber;
      setPlayer(newPlayer);
      setShouldSavePlayer(true);
    },
    [player]
  );

  const teamNumberToastRef = useRef(0);
  useEffect(() => {
    if (!gameState || teamNumber === teamNumberToastRef.current) {
      return;
    }

    if (teamNumber === 1) {
      setTeamNameToast("You have joined " + gameState.teamOneName);
    } else {
      setTeamNameToast("You have joined " + gameState.teamTwoName);
    }
    teamNumberToastRef.current = teamNumber;
  }, [teamNumber, gameState]);

  const openPanelVoteOnClick = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    putPlayerOpenPanelVote(gameState.gameStateId, player.playerId, (p) => {
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
    [setGameState, setCachedGameStateId]
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

    if (player.teamNumber === 1) {
      setTeamGuessStatus(gameState.teamOneGuessStatus);
    } else {
      setTeamGuessStatus(gameState.teamTwoGuessStatus);
    }
  }, [gameState, player]);

  useEffect(() => {
    if (turnType) {
      if (isFirstLoad.current) {
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
    if (isFirstLoad.current) {
      return;
    }

    setPlayer((p) => {
      if (!p) {
        return;
      }

      return { ...p, previousGuesses: [] };
    });
  }, [roundNumber]);

  useEffect(() => {
    if (player) {
      setTeamNumber(player.teamNumber);
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
    if (!gameState) {
      return;
    }

    if (
      innerPanelCountNotify !== gameState.gameStateId &&
      turnType === "OpenPanel" &&
      teamTurn === teamNumber &&
      ((teamNumber === 1 && gameState.teamOneInnerPanels <= 0) || (teamNumber === 2 && gameState.teamTwoInnerPanels <= 0))
    ) {
      setInnerPanelCountNotify(gameState.gameStateId);
      setModalMessage("Your team is out of inner panels. From now on, if you open an inner panel, it will cost one point.");
    }
  }, [setModalMessage, setInnerPanelCountNotify, innerPanelCountNotify, teamNumber, turnType, teamTurn, gameState]);

  useEffect(() => {
    if (!gameState || !player || queryString) {
      return;
    }

    setQueryString("gameStateId=" + gameState.gameStateId + "&playerId=" + player.playerId);
  }, [gameState, queryString, player, setQueryString]);

  useEffect(() => {
    if (gameState || !player) {
      return;
    }

    getGameState(gameStateId, (gs) => {
      if (gs) {
        setGameState(gs);
      }
    });
  }, [gameStateId, gameState, player, setGameState]);

  useEffect(() => {
    if (player) {
      isFirstLoad.current = false;
    }
  }, [player]);

  if (isResuming) {
    return null;
  }

  return (
    <div className="playerContainer">
      <SignalRConnectionStatus></SignalRConnectionStatus>

      {!gameState && <JoinGame isLoading={isLoading} onJoinGame={onJoinGame} cachedGameStateId={cachedGameStateId}></JoinGame>}

      {gameState && !player?.avatar && (
        <ChoosePlayerAvatar
          gameStateId={gameState?.gameStateId}
          playerId={player?.playerId}
          avatar={player?.avatar}
          colors={colors}
          onColorChange={onColorChange}
          onColorRemove={onColorRemove}
          onAvatarSelect={onAvatarSelect}
        ></ChoosePlayerAvatar>
      )}

      {gameState && player?.avatar && !player?.teamNumber && (
        <ChooseTeam
          gameStateId={gameState.gameStateId}
          teamOneName={gameState.teamOneName}
          teamTwoName={gameState.teamTwoName}
          onTeamNumberSelect={onTeamNumberSelect}
        ></ChooseTeam>
      )}

      {gameState && player?.teamNumber > 0 && player?.avatar && (
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
            <MakeGuess
              gameStateId={gameState.gameStateId}
              playerId={player.playerId}
              previousGuesses={player.previousGuesses}
              onSaveGuess={onSaveGuess}
            ></MakeGuess>
          )}

          <VoteGuess
            isVisible={gameState.turnType === "VoteGuess" && !player.isReady}
            gameStateId={gameState.gameStateId}
            playerId={player.playerId}
            onVoteGuess={() => setPlayerReady(true)}
          ></VoteGuess>
        </>
      )}
    </div>
  );
}
