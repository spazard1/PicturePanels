import { useCallback, useContext, useEffect, useRef } from "react";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";

export function useGameboardPing(gameStateId) {
  const intervalRef = useRef();
  const { connection } = useContext(SignalRConnectionContext);

  const gameBoardPing = useCallback(() => {
    if (!connection || !gameStateId) {
      return;
    }

    connection.invoke("GameboardPing", gameStateId);
  }, [connection, gameStateId]);

  useEffect(() => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(gameBoardPing, 30000);
    gameBoardPing();
  }, [gameBoardPing, gameStateId]);
}
