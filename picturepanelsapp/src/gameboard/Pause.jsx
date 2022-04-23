import React from "react";
import PropTypes from "prop-types";

import "./Pause.css";
import { putTogglePauseGame } from "../common/putTogglePauseGame";

const Pause = ({ gameStateId, pauseState, turnType, openPanelTime, guessTime }) => {
  return (
    <>
      {((turnType === "OpenPanel" && openPanelTime > 0) || (turnType === "MakeGuess" && guessTime > 0)) && pauseState !== "Paused" && (
        <div className="pauseContainer">
          <div className="pauseButton" onClick={() => putTogglePauseGame(gameStateId)}>
            <div>II</div>
            <div>Pause</div>
          </div>
        </div>
      )}
      {pauseState === "Paused" && (
        <div className="pauseContainer">
          <div className="resumeButton" onClick={() => putTogglePauseGame(gameStateId)}>
            <div>&#x27A4;</div>
            <div>Resume</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Pause;

Pause.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  pauseState: PropTypes.string,
  turnType: PropTypes.string.isRequired,
  openPanelTime: PropTypes.number.isRequired,
  guessTime: PropTypes.number.isRequired,
};
