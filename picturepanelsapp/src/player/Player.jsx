import React, { useCallback, useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import getGameState from "../common/getGameState";
import Chat from "./Chat";
import PanelButtons from "./PanelButtons";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import TeamGuesses from "./TeamGuesses";
import StartGameButtons from "./StartGameButtons";
import ChooseTeam from "./ChooseTeam";
import JoinGame from "./JoinGame";
import MessageModal from "../common/ModalMessage";
import { useModalMessage } from "../common/useModalMessage";
import putPlayer from "./putPlayer";
import { usePlayerPing } from "./usePlayerPing";
import Button from "react-bootstrap/Button";
import "./Player.css";
import putPlayerOpenPanelVote from "./putPlayerOpenPanelVote";

export default function Player() {
  useBodyClass("player");

  const { queryString, setQueryString } = useSignalRConnection();
  const { modalMessage, setModalMessage, onModalClose } = useModalMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [player, setPlayer] = useState();
  const [teamNumber, setTeamNumber] = useState();
  const { gameState, gameStateId, setGameState } = useGameState();
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

  const onTeamNumberChange = (teamNumber) => {
    if (!teamNumber) {
      setModalMessage("Could not join the game. Refresh the page and try again.");
    } else {
      setTeamNumber(teamNumber);
    }
  };

  const openPanelVoteOnClick = () => {
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

  useEffect(() => {
    if (!gameStateId || !teamNumber || player) {
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
  }, [gameStateId, teamNumber, color, player, setModalMessage]);

  useEffect(() => {
    if (!gameState || !gameStateId || !player || queryString) {
      return;
    }

    setQueryString("gameStateId=" + gameStateId + "&playerId=" + player.playerId);
  }, [gameStateId, gameState, queryString, player, setQueryString]);

  return (
    <div className="main center">
      <MessageModal modalMessage={modalMessage} onModalClose={onModalClose}></MessageModal>

      {!gameState && <JoinGame color={color} isLoading={isLoading} onJoinGame={onJoinGame} onColorChange={onColorChange}></JoinGame>}

      {gameState && !teamNumber && (
        <ChooseTeam
          gameStateId={gameState.gameStateId}
          teamOneName={gameState.teamOneName}
          teamTwoName={gameState.teamTwoName}
          onTeamNumberChange={onTeamNumberChange}
        ></ChooseTeam>
      )}

      {player && (
        <>
          <div className="turnStatusMessage center"></div>

          {gameState && gameState.turnType === "Welcome" && <StartGameButtons turnEndTime={gameState.turnEndTime}></StartGameButtons>}

          {gameState && gameState.turnType === "OpenPanel" && gameState.teamTurn === teamNumber && (
            <>
              <PanelButtons
                gameStateId={gameState.gameStateId}
                playerId={player.playerId}
                revealedPanels={gameState.revealedPanels}
                roundNumber={gameState.roundNumber}
                initialSelectedPanels={player.selectedPanels}
              ></PanelButtons>
              <Button variant="primary" size="lg" onClick={openPanelVoteOnClick}>
                Vote!
              </Button>
            </>
          )}

          {gameState && gameState.turnType === "MakeGuess" && <TeamGuesses gameStateId={gameState.gameStateId}></TeamGuesses>}

          <Chat></Chat>
        </>
      )}
    </div>
  );
}
