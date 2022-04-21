import React, { useCallback } from "react";
import PropTypes from "prop-types";

import "./PanelButtons.css";
import PanelButton from "./PanelButton";
import { useSendSelectedPanels } from "./useSendSelectedPanels";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

const PanelButtons = ({ initialSelectedPanels, gameStateId, playerId, roundNumber, revealedPanels }) => {
  const [selectedPanels, setSelectedPanels] = useSendSelectedPanels(gameStateId, playerId, initialSelectedPanels);

  const onSelected = useCallback(
    (panelNumber) => {
      setSelectedPanels((sp) => {
        if (sp.indexOf(panelNumber) < 0) {
          return [...sp, panelNumber];
        } else {
          const newSelectedPanels = sp.filter((t) => t !== panelNumber);
          return newSelectedPanels;
        }
      });
    },
    [setSelectedPanels]
  );

  return (
    <div className="panelButtons center">
      {panelNumbers.map((panelNumber) => (
        <PanelButton
          key={panelNumber}
          gameStateId={gameStateId}
          panelNumber={panelNumber}
          roundNumber={roundNumber}
          isOpen={revealedPanels.indexOf(panelNumber) >= 0}
          isSelected={selectedPanels.indexOf(panelNumber) >= 0}
          onSelected={onSelected}
        ></PanelButton>
      ))}
    </div>
  );
};

export default PanelButtons;

PanelButtons.propTypes = {
  initialSelectedPanels: PropTypes.arrayOf(PropTypes.string),
  gameStateId: PropTypes.string.isRequired,
  playerId: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  revealedPanels: PropTypes.array.isRequired,
};
