import React, { useCallback } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./PanelButtons.css";

const PanelButton = ({ gameStateId, panelNumber, roundNumber, isOpen, isSelected, onSelected }) => {
  const onSelectedClick = useCallback(
    (pn) => {
      onSelected(pn, isOpen);
    },
    [onSelected, isOpen]
  );

  return (
    <div className={classNames("panelButton", "noHighlights", { panelButtonSelected: isSelected })} onClick={() => onSelectedClick(panelNumber)}>
      <div className={classNames("panelButtonBackground", { hidden: isOpen })}>
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
  isPaused: PropTypes.bool,
};
