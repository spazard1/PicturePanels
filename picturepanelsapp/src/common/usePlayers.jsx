import { useEffect, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";

export function usePlayers(gameStateId, turnType, teamTurn) {
  const [players, setPlayers] = useState({});

  useSignalR("Players", (players) => {
    const newPlayers = players.reduce((aggregate, value) => ({ ...aggregate, [value.playerId]: value }), {});

    setPlayers(newPlayers);
    /*
    setPlayers((ps) => {
      for (const playerId in newPlayers) {
        newPlayers[playerId].isReady = ps[playerId].isReady;
      }

      return newPlayers;
    });
    */
  });

  useSignalR("Player", (player) => {
    setPlayers((ps) => {
      return { ...ps, [player.playerId]: player };
    });
  });

  useSignalR("PlayerReady", (playerId) => {
    setPlayers((ps) => {
      const newPlayers = { ...ps };
      if (playerId in newPlayers) {
        newPlayers[playerId].isReady = true;
      }
      return newPlayers;
    });
  });

  useEffect(() => {
    setPlayers((ps) => {
      const newPlayers = { ...ps };

      for (const playerId in newPlayers) {
        if (turnType === "OpenPanel") {
          if (newPlayers[playerId].teamNumber === teamTurn) {
            newPlayers[playerId].isReady = false;
          } else {
            newPlayers[playerId].isReady = true;
          }
        } else if (turnType === "MakeGuess" || turnType === "VoteGuess") {
          newPlayers[playerId].isReady = false;
        } else {
          newPlayers[playerId].isReady = true;
        }
      }

      return newPlayers;
    });
  }, [turnType, teamTurn]);

  return { players };
}
