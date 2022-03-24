import React, { forwardRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

import "./Panel.css";
import { GetExitClass } from "../animate/Animate";

const Panel = ({ gameStateId, isOpen, roundNumber, panelNumber, entranceClass, setImagesLoaded }, ref) => {
  const [exitClass, setExitClass] = useState();

  useEffect(() => {
    setExitClass(GetExitClass());
  }, [isOpen]);

  return (
    <div id={"panel_" + panelNumber} className="panel">
      <div className={"panelBackground animate__animated animate__slow " + (isOpen ? exitClass : entranceClass)}>
        <div id={"panelNumber_" + panelNumber} className="panelNumber">
          {panelNumber}
        </div>
      </div>
      {gameStateId && (
        <img
          ref={ref}
          className={"panelImage"}
          onLoad={() => {
            setImagesLoaded((imagesLoaded) => {
              return { ...imagesLoaded, [panelNumber]: true };
            });
          }}
          src={"https://picturepanels.azurewebsites.net/api/images/panels/" + gameStateId + "/" + roundNumber + "/" + (isOpen ? panelNumber : 0)}
        />
      )}
    </div>
  );
};

export default forwardRef(Panel);

Panel.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  panelNumber: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  entranceClass: PropTypes.string.isRequired,
  setImagesLoaded: PropTypes.object.isRequired,
};
