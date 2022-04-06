import React, { forwardRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./Panel.css";
import { GetExitClass } from "../animate/Animate";

const Panel = ({ gameStateId, isOpen, roundNumber, panelNumber, entranceClass, setImagesLoaded }, ref) => {
  const [exitClass, setExitClass] = useState();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState();

  useEffect(() => {
    setImageLoaded(false);
    setExitClass(GetExitClass());
  }, [isOpen]);

  useEffect(() => {
    if (gameStateId && roundNumber) {
      setImgSrc("https://picturepanels.azurewebsites.net/api/images/panels/" + gameStateId + "/" + roundNumber + "/" + (isOpen ? panelNumber : 0));
      return;
    }
    setImgSrc("https://picturepanels.azurewebsites.net/api/images/panels/welcome/0/" + panelNumber);
  }, [gameStateId, roundNumber, isOpen, panelNumber]);

  return (
    <div id={"panel_" + panelNumber} className="panel">
      <div
        className={classNames("panelBackground", "animate__animated", "animate__slow", {
          [`${exitClass}`]: isOpen && imageLoaded,
          [`${entranceClass}`]: !isOpen,
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
          setImagesLoaded((imagesLoaded) => {
            return { ...imagesLoaded, [panelNumber]: true };
          });
        }}
        src={imgSrc}
      />
    </div>
  );
};

export default forwardRef(Panel);

Panel.propTypes = {
  gameStateId: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  panelNumber: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  entranceClass: PropTypes.string.isRequired,
  setImagesLoaded: PropTypes.object.isRequired,
};
