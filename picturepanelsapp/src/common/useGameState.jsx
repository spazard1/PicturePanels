import { useEffect, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";
import getGameState from "./getGameState";

export function useGameState(gameStateId, onError) {
  const [gameState, setGameState] = useState();

  const connectionId = useSignalR("GameState", (gameState) => {
    setGameState(gameState);
  });

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    getGameState(gameStateId, (gs) => {
      if (!gs) {
        onError();
        return;
      }

      setGameState(gs);
    });
  }, [gameStateId, connectionId, onError]);

  return { gameState };
}
