import { useEffect, useRef, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";
import getGameState from "./getGameState";

export function useGameState() {
  const [gameState, setGameState] = useState();
  const [gameStateId, setGameStateId] = useState();
  const connectionIdRef = useRef();

  const connectionId = useSignalR("GameState", (gameState) => {
    setGameState(gameState);
  });

  useEffect(() => {
    if (!gameState || !gameState.gameStateId || gameState.gameStateId === gameStateId) {
      return;
    }

    setGameStateId(gameState.gameStateId);
    localStorage.setItem("gameStateId", gameState.gameStateId);
  }, [gameState, gameStateId]);

  useEffect(() => {
    if (!gameStateId || !connectionId) {
      return;
    }

    // don't need to query for gamestate on first connection to signalr
    if (!connectionIdRef.current) {
      connectionIdRef.current = connectionId;
      return;
    }

    getGameState(gameStateId, (gs) => {
      if (!gs) {
        return;
      }

      setGameState(gs);
    });
  }, [gameStateId, connectionId]);

  return { gameState, gameStateId, setGameState };
}
