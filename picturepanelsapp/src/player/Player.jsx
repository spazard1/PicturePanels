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
import "./Player.css";

export default function Player() {
  useBodyClass("player");

  const { queryString, setQueryString } = useSignalRConnection();
  const { modalMessage, setModalMessage, onModalClose } = useModalMessage();
  const [isLoading, setIsLoading] = useState(false);
  const { gameState, gameStateId, setGameState } = useGameState();

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

    getGameState(gameOptions.gameStateId, (gs) => {
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

  useEffect(() => {
    if (!gameState || !gameStateId) {
      return;
    }

    if (!queryString) {
      setQueryString("gameStateId=" + gameStateId);
    }
  }, [gameStateId, gameState, queryString, setQueryString]);

  return (
    <div className="main center">
      <MessageModal modalMessage={modalMessage} onModalClose={onModalClose}></MessageModal>

      <JoinGame color={color} isLoading={isLoading} onJoinGame={onJoinGame} onColorChange={onColorChange}></JoinGame>

      {gameState && <ChooseTeam teamOneName={gameState.teamOneName} teamTwoName={gameState.teamTwoName}></ChooseTeam>}

      <div className="turnStatusMessage center"></div>

      {gameState && gameState.turnType === "Welcome" && <StartGameButtons turnEndTime={gameState.turnEndTime}></StartGameButtons>}

      {gameState && <PanelButtons></PanelButtons>}
      {gameState && <TeamGuesses></TeamGuesses>}

      <Chat></Chat>
    </div>
  );
}
