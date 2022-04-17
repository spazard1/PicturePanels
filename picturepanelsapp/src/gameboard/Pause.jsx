import React from "react";
import PropTypes from "prop-types";

import "./Pause.css";
import { putPauseGame, putResumeGame } from "./putPauseGame";

const Pause = ({ gameStateId, pauseState, turnType, openPanelTime, guessTime }) => {
  return (
    <>
      {((turnType === "OpenPanel" && openPanelTime > 0) || (turnType === "MakeGuess" && guessTime > 0)) && (
        <div className="pauseContainer">
          {pauseState === "" && (
            <div className="pauseButton" onClick={() => putPauseGame(gameStateId)}>
              <div>II</div>
              <div>Pause</div>
            </div>
          )}
          {pauseState === "Paused" && (
            <div className="resumeButton" onClick={() => putResumeGame(gameStateId)}>
              <div>&#x27A4;</div>
              <div>Resume</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Pause;

Pause.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  pauseState: PropTypes.string.isRequired,
  turnType: PropTypes.string.isRequired,
  openPanelTime: PropTypes.number.isRequired,
  guessTime: PropTypes.number.isRequired,
};
