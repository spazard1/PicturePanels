import { useEffect, useRef, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";

export function useSelectedPanels(players, turnType) {
  const [selectedPanels, setSelectedPanels] = useState({});
  const selectedPanelsRef = useRef();
  selectedPanelsRef.current = selectedPanels;

  useEffect(() => {
    const newSelectedPanels = {};
    for (const playerId in players) {
      newSelectedPanels[playerId] = players[playerId].selectedPanels;
    }
    setSelectedPanels(newSelectedPanels);
  }, [players]);

  useEffect(() => {
    if (turnType && turnType !== "OpenPanel") {
      setSelectedPanels({});
    }
  }, [turnType]);

  useSignalR("SelectPanels", (player) => {
    setSelectedPanels({ ...selectedPanelsRef.current, [player.playerId]: player.selectedPanels });
  });

  return { selectedPanels };
}
