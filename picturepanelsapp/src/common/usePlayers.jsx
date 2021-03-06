import { useEffect, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";
import Color from "color";

export function usePlayers(turnType, teamTurn, playPlayerJoinSound) {
  const [players, setPlayers] = useState({});

  useSignalR("Players", (players) => {
    const newPlayers = players.reduce((aggregate, value) => ({ ...aggregate, [value.playerId]: value }), {});

    for (const playerId in newPlayers) {
      newPlayers[playerId].colors = newPlayers[playerId].colors.map((c) => Color(c));
    }

    setPlayers(newPlayers);
  });

  useSignalR("Player", (player, isNewTeam) => {
    player.colors = player.colors.map((c) => Color(c));
    setPlayers((ps) => {
      return { ...ps, [player.playerId]: player };
    });

    if (isNewTeam) {
      playPlayerJoinSound();
    }
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

  useSignalR("SelectPanels", (player) => {
    setPlayers((ps) => {
      const newPlayers = { ...ps };
      if (player.playerId in newPlayers) {
        newPlayers[player.playerId].selectedPanels = player.selectedPanels ?? [];
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
            newPlayers[playerId].selectedPanels = [];
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
