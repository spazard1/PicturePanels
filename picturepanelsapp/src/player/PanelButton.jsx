import React from "react";
import PropTypes from "prop-types";

import "./PanelButtons.css";
import classNames from "classnames";

const PanelButton = ({ gameStateId, panelNumber, roundNumber, isOpen, isSelected, onSelected }) => {
  return (
    <div className={classNames("panelButton", "noHighlights", { panelButtonSelected: isSelected })} onClick={() => onSelected(panelNumber)}>
      <div className="panelButtonBackground">
        <div className="panelButtonNumber">{panelNumber}</div>
      </div>
      <img
        className="panelButtonImage"
        src={"https://picturepanels.azurewebsites.net/api/images/panels/" + gameStateId + "/" + roundNumber + "/" + (isOpen ? panelNumber : 0)}
      />
    </div>
  );
};

export default React.memo(PanelButton);

PanelButton.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  panelNumber: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelected: PropTypes.func.isRequired,
};
