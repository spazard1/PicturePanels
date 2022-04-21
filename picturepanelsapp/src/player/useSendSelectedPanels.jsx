import { useContext, useEffect, useState } from "react";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";

export function useSendSelectedPanels(gameStateId, playerId, initialSelectedPanels) {
  const [selectedPanels, setSelectedPanels] = useState(initialSelectedPanels);
  const { connection } = useContext(SignalRConnectionContext);

  useEffect(() => {
    if (!connection) {
      return;
    }

    connection.invoke("SelectPanels", {
      gameStateId: gameStateId,
      playerId: playerId,
      selectedPanels: selectedPanels,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, selectedPanels]);

  return [selectedPanels, setSelectedPanels];
}
