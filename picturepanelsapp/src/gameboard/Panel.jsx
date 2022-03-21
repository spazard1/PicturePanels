import React from "react";
import PropTypes from "prop-types";

import "./Panel.css";

export default function Panel({ panelNumber }) {
  return (
    <div id={"panel_" + panelNumber} className="panel">
      <div className="panelBackground animate__animated animate__slow">
        <div id={"panelNumber_" + panelNumber} className="panelNumber">
          {panelNumber}
        </div>
      </div>
    </div>
  );
}

Panel.propTypes = {
  panelNumber: PropTypes.number.isRequired,
};
