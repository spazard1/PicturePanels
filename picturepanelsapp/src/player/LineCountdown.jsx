import React from "react";
import useTimeRemaining from "../common/useTimeRemaining";
import PropTypes from "prop-types";

import "./LineCountdown.css";

const LineCountdown = ({ isCountdownActive, isPaused, turnTime, turnTimeRemaining }) => {
  const timeRemaining = useTimeRemaining(isPaused, turnTime, turnTimeRemaining, 30);

  if (!isCountdownActive) {
    return null;
  }

  return (
    <div className="lineCountdownContainer">
      <div className="lineCountdownElapsedTime" style={{ width: 100 - timeRemaining.percentageRemaining * 100 + "%" }}></div>
    </div>
  );
};

export default LineCountdown;

LineCountdown.propTypes = {
  isCountdownActive: PropTypes.bool,
  isPaused: PropTypes.bool.isRequired,
  turnTime: PropTypes.number,
  turnTimeRemaining: PropTypes.number,
};
