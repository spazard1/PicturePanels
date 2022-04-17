import React, { useCallback, useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import Chat from "./Chat";
import PanelButtons from "./PanelButtons";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import ErrorMessageModal from "../common/ErrorMessageModal";
import TeamGuesses from "./TeamGuesses";
import StartGameButtons from "./StartGameButtons";
import ChooseTeam from "./ChooseTeam";
import JoinGame from "./JoinGame";
import "./Player.css";

export default function Player() {
  useBodyClass("player");

  const [gameStateId, setGameStateId] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const { queryString, setQueryString } = useSignalRConnection();
  const { gameState } = useGameState(gameStateId, onGameStateLoadError);

  const onJoinGame = (gameStateId) => {
    setGameStateId(gameStateId);
  };

  useEffect(() => {
    if (!gameState || !gameStateId) {
      return;
    }

    if (!queryString) {
      setQueryString("gameStateId=" + gameStateId);
    }
  }, [gameStateId, gameState, queryString, setQueryString]);

  const onGameStateLoadError = useCallback(() => {
    setGameStateId("");
    setErrorMessage("Did not find a game with that code. Check the game code and try again.");
  }, []);

  return (
    <div className="main">
      <ErrorMessageModal errorMessage={errorMessage}></ErrorMessageModal>

      <JoinGame onJoinGame={onJoinGame}></JoinGame>

      <ChooseTeam></ChooseTeam>

      <div className="turnStatusMessage center"></div>

      <PanelButtons></PanelButtons>
      <TeamGuesses></TeamGuesses>

      {gameState && gameState.turnType === "Welcome" && <StartGameButtons turnEndTime={gameState.turnEndTime}></StartGameButtons>}

      <Chat></Chat>
    </div>
  );
}
