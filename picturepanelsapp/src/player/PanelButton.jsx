import React from "react";
import PropTypes from "prop-types";

import "./PanelButtons.css";

const PanelButton = ({ gameStateId, panelNumber, roundNumber, isOpen }) => {
  return (
    <div className="panelButton noHighlights">
      <div className="panelButtonBackground">
        <div className="panelButtonNumber">{panelNumber}</div>
      </div>
      <img className="panelButtonImage" src={"/api/images/panels/" + gameStateId + "/" + roundNumber + "/" + (isOpen ? panelNumber : 0)} />
    </div>
  );
};

export default PanelButton;

PanelButton.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  panelNumber: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
};
