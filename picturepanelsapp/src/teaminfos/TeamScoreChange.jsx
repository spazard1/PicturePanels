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
    clearInterval(intervalRef.current);

    if (changeType === "GuessesMade") {
      intervalRef.current = setTimeout(() => setScoreChange(scoreChange), 5000);
    } else {
      setScoreChange(scoreChange);
    }
  }, [scoreChange, changeType]);

  useEffect(() => {
    setScoreChangeVisible(false);
  }, [turnType]);

  return (
    <div
      className={classNames("teamScoreChange", "hideIfEmpty", "animate__animated", {
        teamOneBox: teamNumber === 1,
        teamTwoBox: teamNumber === 2,
        animate__bounceInDown: scoreChangeVisible,
        animate__bounceOutUp: !scoreChangeVisible,
        animate__slow: scoreChangeVisible,
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
