import React from "react";
import PropTypes from "prop-types";

import "./PanelButtons.css";
import PanelButton from "./PanelButton";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

const PanelButtons = ({ gameStateId, roundNumber, revealedPanels }) => {
  return (
    <div className="panelButtons center">
      {panelNumbers.map((panelNumber) => (
        <PanelButton
          key={panelNumber}
          gameStateId={gameStateId}
          panelNumber={panelNumber}
          roundNumber={roundNumber}
          isOpen={revealedPanels.indexOf(panelNumber) >= 0}
        ></PanelButton>
      ))}
    </div>
  );
};

export default PanelButtons;

PanelButtons.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  revealedPanels: PropTypes.array.isRequired,
};
