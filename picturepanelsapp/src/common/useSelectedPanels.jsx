import { useEffect, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";

export function useSelectedPanels(players, turnType) {
  const [selectedPanels, setSelectedPanels] = useState({});

  useEffect(() => {
    setSelectedPanels((sp) => {
      const newSelectedPanels = { ...sp };
      console.log("new players", sp);

      for (const playerId in players) {
        if (!(playerId in newSelectedPanels)) {
          newSelectedPanels[playerId] = players[playerId].selectedPanels;
        }
      }

      return newSelectedPanels;
    });
  }, [players]);

  useEffect(() => {
    if (turnType && turnType !== "OpenPanel") {
      setSelectedPanels((sp) => {
        console.log("resetting", sp);

        const newSelectedPanels = { ...sp };

        for (const playerId in sp) {
          newSelectedPanels[playerId] = [];
        }

        return newSelectedPanels;
      });
    }

    return () => {
      console.log("unmount");
      console.log();
    };
  }, [turnType]);

  useSignalR("SelectPanels", (player) => {
    setSelectedPanels((sp) => {
      return { ...sp, [player.playerId]: player.selectedPanels };
    });
  });

  return { selectedPanels };
}
