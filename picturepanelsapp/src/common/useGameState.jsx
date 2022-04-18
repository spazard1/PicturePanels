import { useEffect, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";
import getGameState from "./getGameState";

export function useGameState(gameStateId, onLoad, onError) {
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
      onLoad();
      localStorage.setItem("gameStateId", gs.gameStateId);
    });
  }, [gameStateId, connectionId, onLoad, onError]);

  return { gameState };
}
