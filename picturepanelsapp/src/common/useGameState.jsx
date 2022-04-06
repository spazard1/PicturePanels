import { useEffect, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";
import getGameState from "./getGameState";

export function useGameState(gameStateId, onError) {
  const [gameState, setGameState] = useState({});

  const connectionId = useSignalR("GameState", (gameState) => {
    setGameState(gameState);
  });

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    getGameState(gameStateId, (gameState) => {
      console.log("getting game state", gameState);
      if (!gameState) {
        onError();
        return;
      }
      setGameState(gameState);
    });
  }, [gameStateId, connectionId, onError]);

  return { gameState };
}
