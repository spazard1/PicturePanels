import { useCallback, useContext, useEffect, useRef } from "react";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";

export function usePlayerPing(gameStateId, player) {
  const intervalRef = useRef();
  const { connection } = useContext(SignalRConnectionContext);

  const playerPing = useCallback(() => {
    if (!connection || !gameStateId || !player) {
      return;
    }

    if (connection.state !== "Connected") {
      return;
    }

    connection.invoke("PlayerPing", gameStateId, player.playerId);
  }, [connection, gameStateId, player]);

  useEffect(() => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(playerPing, 30000);
  }, [playerPing]);
}
