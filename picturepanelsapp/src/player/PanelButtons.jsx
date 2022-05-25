import React from "react";
import PropTypes from "prop-types";

import "./PanelButtons.css";
import PanelButton from "./PanelButton";
import { useSendSelectedPanels } from "./useSendSelectedPanels";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

const PanelButtons = ({ player, roundNumber, revealedPanels, onSelectedPanels }) => {
  useSendSelectedPanels(player);

  const onSelected = (panelNumber, isOpen) => {
    if (!isOpen && player.selectedPanels.indexOf(panelNumber) < 0) {
      onSelectedPanels([...player.selectedPanels, panelNumber]);
    } else {
      onSelectedPanels(player.selectedPanels.filter((t) => t !== panelNumber));
    }
  };

  return (
    <div className="panelButtons">
      {panelNumbers.map((panelNumber) => (
        <PanelButton
          key={panelNumber}
          gameStateId={player.gameStateId}
          panelNumber={panelNumber}
          roundNumber={roundNumber}
          isOpen={revealedPanels.indexOf(panelNumber) >= 0}
          isSelected={player.selectedPanels && player.selectedPanels.indexOf(panelNumber) >= 0}
          onSelected={onSelected}
        ></PanelButton>
      ))}
    </div>
  );
};

export default PanelButtons;

PanelButtons.propTypes = {
  player: PropTypes.object.isRequired,
  roundNumber: PropTypes.number.isRequired,
  revealedPanels: PropTypes.array.isRequired,
  onSelectedPanels: PropTypes.func.isRequired,
};
