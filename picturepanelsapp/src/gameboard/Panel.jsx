import React from "react";
import PropTypes from "prop-types";

import "./Panel.css";

export default function Panel({
  isOpen,
  roundNumber,
  panelNumber,
  animationClasses,
}) {
  return (
    <div id={"panel_" + panelNumber} className="panel">
      <div
        className={
          "panelBackground animate__animated animate__slow " +
          animationClasses.join(" ")
        }
      >
        <div id={"panelNumber_" + panelNumber} className="panelNumber">
          {panelNumber}
        </div>
        <img
          className={"panelImage"}
          src={
            "https://picturepanels.azurewebsites.net/api/images/panels/KDML/" +
            roundNumber +
            "/" +
            (isOpen ? panelNumber : 0)
          }
        />
      </div>
    </div>
  );
}

Panel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  panelNumber: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  animationClasses: PropTypes.arrayOf(PropTypes.string).isRequired,
};
