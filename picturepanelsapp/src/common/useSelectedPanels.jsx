import { useEffect, useRef, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";

export function useSelectedPanels(players) {
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

  useSignalR("SelectPanels", (player) => {
    setSelectedPanels({ ...selectedPanelsRef.current, [player.playerId]: player.selectedPanels });
  });

  return { selectedPanels };
}
