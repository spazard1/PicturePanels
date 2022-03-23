import { useEffect, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";
import getGameState from "./getGameState";

export function useGameState(gameStateId) {
  const [gameState, setGameState] = useState({});

  const connectionId = useSignalR("GameState", (gameState) => {
    setGameState(gameState);
  });

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    getGameState(gameStateId, (gameState) => {
      setGameState(gameState);
    });
  }, [gameStateId, connectionId]);

  return { gameState };
}
