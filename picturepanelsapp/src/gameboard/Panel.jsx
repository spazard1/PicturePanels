import React, { forwardRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

import "./Panel.css";
import { GetExitClass } from "../animate/Animate";

const Panel = ({ isOpen, roundNumber, panelNumber, entranceClass }, ref) => {
  const [exitClass, setExitClass] = useState();

  useEffect(() => {
    setExitClass(GetExitClass());
  }, [isOpen]);

  return (
    <div ref={ref} id={"panel_" + panelNumber} className="panel">
      <div className={"panelBackground animate__animated animate__slow " + (isOpen ? exitClass : entranceClass)}>
        <div id={"panelNumber_" + panelNumber} className="panelNumber">
          {panelNumber}
        </div>
      </div>
      <img
        className={"panelImage"}
        src={"https://picturepanels.azurewebsites.net/api/images/panels/KDML/" + roundNumber + "/" + (isOpen ? panelNumber : 0)}
      />
    </div>
  );
};

export default forwardRef(Panel);

Panel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  panelNumber: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  entranceClass: PropTypes.string.isRequired,
};
