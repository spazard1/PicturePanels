import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./TeamScoreChange.css";

const TeamScoreChange = ({ teamNumber, scoreChange, changeType, turnType }) => {
  const [scoreChangeDisplay, setScoreChangeDisplay] = useState();
  const [scoreChangeVisible, setScoreChangeVisible] = useState(false);
  const intervalRef = useRef();

  const setScoreChange = (sc) => {
    if (sc < 0) {
      setScoreChangeDisplay(sc);
      setScoreChangeVisible(true);
    } else if (sc > 0) {
      setScoreChangeDisplay("+" + sc);
      setScoreChangeVisible(true);
    } else {
      setScoreChangeVisible(false);
    }
  };

  useEffect(() => {
    setScoreChange(scoreChange);
  }, [scoreChange]);

  useEffect(() => {
    if (
      turnType === "EndRound" ||
      turnType === "EndGame" ||
      (changeType === "OpenPanel" && turnType === "GuessesMade") ||
      (changeType === "GuessesMade" && turnType === "OpenPanel")
    ) {
      setScoreChangeVisible(false);
    }

    clearInterval(intervalRef.current);
    if (changeType === "OpenPanel") {
      intervalRef.current = setTimeout(() => {
        setScoreChangeVisible(false);
      }, 7000);
    }
  }, [changeType, turnType]);

  return (
    <div
      className={classNames("teamScoreChange", "hideIfEmpty", "animate__animated", {
        teamOneBox: teamNumber === 1,
        teamTwoBox: teamNumber === 2,
        animate__bounceInDown: scoreChangeVisible,
        animate__bounceOutUp: !scoreChangeVisible,
        animate__slow: scoreChangeVisible,
        "animate__delay-10s": changeType === "GuessesMade" && scoreChangeVisible,
      })}
    >
      {scoreChangeDisplay}
    </div>
  );
};

TeamScoreChange.propTypes = {
  teamNumber: PropTypes.number.isRequired,
  scoreChange: PropTypes.number,
  changeType: PropTypes.string,
  turnType: PropTypes.string,
};

export default TeamScoreChange;
