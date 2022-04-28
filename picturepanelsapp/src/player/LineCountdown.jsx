import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import "./LineCountdown.css";

const LineCountdown = ({ isCountdownActive, isPaused, turnTime, turnTimeTotal, turnTimeRemaining, pauseTurnRemainingTime }) => {
  const intervalRef = useRef();
  const endTimeRef = useRef();
  const countdownMax = useRef();
  const currentCountdown = useRef();
  const [percentageRemaining, setPercentageRemaining] = useState();
  const frameRate = 60;

  useEffect(() => {
    if (!isCountdownActive) {
      setPercentageRemaining(0);
      return;
    }

    countdownMax.current = turnTime * 1000;
    currentCountdown.current = turnTimeRemaining;

    endTimeRef.current = new Date();
    endTimeRef.current.setMilliseconds(endTimeRef.current.getMilliseconds() + turnTimeRemaining * 1000);

    if (countdownMax.current <= 0) {
      return;
    }

    clearInterval(intervalRef.current);

    if (isPaused) {
      currentCountdown.current = pauseTurnRemainingTime * 1000;
      setPercentageRemaining(100 - (Math.min(currentCountdown.current, countdownMax.current) / countdownMax.current) * 100);
      return;
    }

    intervalRef.current = setInterval(function () {
      setPercentageRemaining(100 - (Math.min(currentCountdown.current, countdownMax.current) / countdownMax.current) * 100);

      if (currentCountdown.current <= 0) {
        clearInterval(intervalRef.current);
      } else {
        currentCountdown.current = endTimeRef.current - new Date();
      }
    }, 1000 / frameRate);
  }, [isCountdownActive, isPaused, turnTime, turnTimeTotal, turnTimeRemaining, pauseTurnRemainingTime]);

  return (
    <div className="lineCountdownContainer">
      <div className="lineCountdownElapsedTime" style={{ width: percentageRemaining + "%" }}></div>
    </div>
  );
};

export default LineCountdown;

LineCountdown.propTypes = {
  isCountdownActive: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
  turnTime: PropTypes.number,
  turnTimeTotal: PropTypes.number,
  turnTimeRemaining: PropTypes.number,
  pauseTurnRemainingTime: PropTypes.number,
};
