import React, { forwardRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./Panel.css";
import { GetExitClass } from "../animate/Animate";

const Panel = ({ gameStateId, isOpen, roundNumber, panelNumber, entranceClass, onImageLoaded, turnType }, ref) => {
  const [exitClass, setExitClass] = useState();
  const [hasExited, setHasExited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState();

  useEffect(() => {
    if (isOpen) {
      setExitClass(GetExitClass());
      setHasExited(true);
    }
  }, [isOpen]);

  useEffect(() => {
    let newImgSrc = "";
    if (gameStateId && roundNumber && turnType !== "Welcome") {
      newImgSrc = "https://picturepanels.azurewebsites.net/api/images/panels/" + gameStateId + "/" + roundNumber + "/" + (isOpen ? panelNumber : 0);
    } else {
      newImgSrc = "https://picturepanels.azurewebsites.net/api/images/panels/welcome/0/" + panelNumber;
    }
    if (imgSrc !== newImgSrc) {
      setImageLoaded(false);
      setImgSrc(newImgSrc);
    }
  }, [imgSrc, gameStateId, roundNumber, isOpen, panelNumber, turnType]);

  return (
    <div id={"panel_" + panelNumber} className="panel">
      <div
        className={classNames("panelBackground", "animate__animated", "animate__slow", {
          [`${exitClass}`]: isOpen && imageLoaded,
          [`${entranceClass}`]: !isOpen && hasExited,
          animate__infinite: isOpen && !imageLoaded,
          animate__pulse: isOpen && !imageLoaded,
        })}
      >
        <div id={"panelNumber_" + panelNumber} className="panelNumber">
          {panelNumber}
        </div>
      </div>
      <img
        ref={ref}
        className={"panelImage"}
        onLoad={() => {
          setImageLoaded(true);
          onImageLoaded(panelNumber);
        }}
        src={imgSrc}
      />
    </div>
  );
};

export default React.memo(forwardRef(Panel));

Panel.propTypes = {
  gameStateId: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  panelNumber: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  entranceClass: PropTypes.string.isRequired,
  onImageLoaded: PropTypes.func.isRequired,
  turnType: PropTypes.string.isRequired,
};
