import React, { forwardRef, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { GetExitClass } from "../../animate/Animate";
import serverUrl from "../../common/ServerUrl";

import "./Panel.css";

const Panel = ({ gameStateId, isOpen, roundNumber, panelNumber, entranceClass, onImageLoaded, turnType }, ref) => {
  const [exitClass, setExitClass] = useState();
  const [hasExited, setHasExited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayPanelNumber, setDisplayPanelNumber] = useState(false);
  const [imgSrc, setImgSrc] = useState();
  const [hidden, setHidden] = useState(false);
  const panelElementRef = useRef();

  useEffect(() => {
    setHidden(false);
    if (isOpen) {
      setExitClass(GetExitClass());
      setHasExited(true);

      panelElementRef.current.addEventListener(
        "animationend",
        () => {
          setHidden(true);
        },
        { once: true }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    let newImgSrc = "";
    if (gameStateId && roundNumber && turnType !== "Welcome") {
      newImgSrc = serverUrl + "api/images/panels/" + gameStateId + "/" + roundNumber + "/" + (isOpen ? panelNumber : 0);
    } else {
      newImgSrc = serverUrl + "api/images/panels/welcome/0/" + (isOpen ? panelNumber : 0);
    }
    if (imgSrc !== newImgSrc) {
      setImageLoaded(false);
      setImgSrc(newImgSrc);
    }
  }, [imgSrc, gameStateId, roundNumber, isOpen, panelNumber, turnType]);

  return (
    <div className="panel">
      <div
        ref={panelElementRef}
        className={classNames("panelBackground", "animate__animated", "animate__slow", {
          [`${exitClass}`]: isOpen && imageLoaded,
          "animate__delay-7s": isOpen && imageLoaded && turnType === "GuessesMade",
          "animate__delay-1s": isOpen && imageLoaded && turnType === "EndRound",
          [`${entranceClass}`]: !isOpen && hasExited,
          hidden: hidden && isOpen,
        })}
      >
        {displayPanelNumber && <div className="panelNumber">{panelNumber}</div>}
      </div>
      <img
        ref={ref}
        className={"panelImage"}
        onLoad={() => {
          setImageLoaded(true);
          onImageLoaded(panelNumber);
          setDisplayPanelNumber(true);
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
