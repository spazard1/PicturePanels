import { useEffect, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";
import getPlayers from "./getPlayers";

export function usePlayers(gameStateId) {
  const [players, setPlayers] = useState({});

  const connectionId = useSignalR("Players", (players) => {
    setPlayers(players);
  });

  useSignalR("AddPlayer", (player) => {
    const newPlayers = { ...players };
    newPlayers[player.id] = player;
    setPlayers(newPlayers);
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

  return { players, setPlayers };
}
