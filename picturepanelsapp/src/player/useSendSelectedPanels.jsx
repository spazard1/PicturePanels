import { useContext, useEffect, useState } from "react";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";

export function useSendSelectedPanels(gameStateId, playerId) {
  const [selectedPanels, setSelectedPanels] = useState(false);
  const { connection } = useContext(SignalRConnectionContext);

  useEffect(() => {
    if (!connection) {
      return;
    }

    if (selectedPanels === false) {
      return;
    }

    if (connection.state !== "Connected") {
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
