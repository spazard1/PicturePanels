import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import "./LineCountdown.css";

const LineCountdown = ({ isCountdownActive, isPaused, turnTime, turnTimeTotal, turnTimeRemaining }) => {
  const intervalRef = useRef();
  const endTimeRef = useRef();
  const countdownMax = useRef();
  const currentCountdown = useRef();
  const [percentageRemaining, setPercentageRemaining] = useState();
  const frameRate = 60;

  useEffect(() => {
    countdownMax.current = turnTime * 1000;
    endTimeRef.current = new Date();
    endTimeRef.current.setMilliseconds(endTimeRef.current.getMilliseconds() + turnTimeRemaining * 1000);

    if (isPaused) {
      currentCountdown.current = turnTimeRemaining * 1000;
      setPercentageRemaining(100 - (Math.min(currentCountdown.current, countdownMax.current) / countdownMax.current) * 100);
      return;
    }
  }, [isPaused, turnTime, turnTimeTotal, turnTimeRemaining]);

  useEffect(() => {
    if (!isCountdownActive) {
      setPercentageRemaining(0);
      clearInterval(intervalRef.current);
      return;
    }

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(function () {
      if (!isPaused) {
        currentCountdown.current = endTimeRef.current - new Date();
      }
      setPercentageRemaining(100 - (Math.min(currentCountdown.current, countdownMax.current) / countdownMax.current) * 100);

      if (currentCountdown.current <= 0 || isPaused) {
        clearInterval(intervalRef.current);
      }
    }, 1000 / frameRate);
  }, [isCountdownActive, isPaused, turnTimeRemaining]);

  return (
    <div className="lineCountdownContainer">
      <div className="lineCountdownElapsedTime" style={{ width: percentageRemaining + "%" }}></div>
    </div>
  );
};

export default LineCountdown;

LineCountdown.propTypes = {
  isCountdownActive: PropTypes.bool,
  isPaused: PropTypes.bool.isRequired,
  turnTime: PropTypes.number,
  turnTimeTotal: PropTypes.number,
  turnTimeRemaining: PropTypes.number,
};
