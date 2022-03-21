import React, { useEffect, useState } from "react";
import Panel from "./Panel";

import "./Panels.css";
import { useSignalR } from "../signalr/useSignalR";

const panelNumbers = [...Array(20).keys()].map(
  (panelNumber) => panelNumber + 1
);

export default function Panels() {
  const [revealedPanels, setRevealedPanels] = useState([]);

  useSignalR("GameState", (gameState) => {
    setRevealedPanels(gameState.revealedPanels);
  });

  useEffect(() => {
    setRevealedPanels([1]);
  }, []);

  return (
    <div id="panels" className="panels center">
      {panelNumbers.map((panelNumber) => (
        <>
          {revealedPanels.indexOf(panelNumber) > 0 && (
            <Panel
              className={"isOpen"}
              key={panelNumber}
              panelNumber={panelNumber}
            ></Panel>
          )}
          {revealedPanels.indexOf(panelNumber) <= 0 && (
            <Panel key={panelNumber} panelNumber={panelNumber}></Panel>
          )}
        </>
      ))}
    </div>
  );
}
