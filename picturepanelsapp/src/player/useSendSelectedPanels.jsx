import { useContext, useEffect, useRef } from "react";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";

export function useSendSelectedPanels(player) {
  const { connection } = useContext(SignalRConnectionContext);
  const panelCountRef = useRef();

  useEffect(() => {
    if (!connection) {
      return;
    }

    if (panelCountRef.current === player.selectedPanels.length) {
      return;
    }

    if (connection.state !== "Connected") {
      return;
    }

    connection.invoke("SelectPanels", {
      gameStateId: player.gameStateId,
      playerId: player.playerId,
      selectedPanels: player.selectedPanels,
    });
  }, [connection, player]);
}
