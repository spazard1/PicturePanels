import { useEffect, useRef, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";
import getPlayers from "./getPlayers";

export function usePlayers(gameStateId) {
  const [players, setPlayers] = useState({});
  const playersRef = useRef();
  playersRef.current = players;

  const connectionId = useSignalR("Players", (players) => {
    console.log("setting new players", players);
    setPlayers(players);
  });

  useSignalR("AddPlayer", (player) => {
    setPlayers({ ...playersRef.current, [player.playerId]: player });
  });

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    getPlayers(gameStateId, (players) => {
      const newPlayers = players.reduce((aggregate, value) => ({ ...aggregate, [value.playerId]: value }), {});

      setPlayers(newPlayers);
    });
  }, [gameStateId, connectionId]);

  return { players };
}
