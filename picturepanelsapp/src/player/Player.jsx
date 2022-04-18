import React, { useCallback, useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
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

  const [gameStateId, setGameStateId] = useState();
  const [playerName, setPlayerName] = useState();
  const { queryString, setQueryString } = useSignalRConnection();
  const { modalMessage, setModalMessage, onModalClose } = useModalMessage();

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

  const onGameStateLoadError = useCallback(() => {
    setGameStateId("");
    setModalMessage("Did not find a game with that code. Check the game code and try again.");
  }, [setModalMessage]);

  const { gameState } = useGameState(gameStateId, onGameStateLoadError);

  const onJoinGame = (gameOptions) => {
    setGameStateId(gameOptions.gameStateId);
    setPlayerName(gameOptions.playerName);
    console.log(playerName);
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
    <div className="main">
      <MessageModal modalMessage={modalMessage} onModalClose={onModalClose}></MessageModal>

      <JoinGame color={color} onJoinGame={onJoinGame} onColorChange={onColorChange}></JoinGame>

      {gameState && <ChooseTeam teamOneName={gameState.teamOneName} teamTwoName={gameState.teamTwoName}></ChooseTeam>}

      <div className="turnStatusMessage center"></div>

      {gameState && <PanelButtons></PanelButtons>}
      {gameState && <TeamGuesses></TeamGuesses>}

      {gameState && gameState.turnType === "Welcome" && <StartGameButtons turnEndTime={gameState.turnEndTime}></StartGameButtons>}

      <Chat></Chat>
    </div>
  );
}
