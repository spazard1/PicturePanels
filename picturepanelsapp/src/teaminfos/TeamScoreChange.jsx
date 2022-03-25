import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./TeamScoreChange.css";

const TeamScoreChange = ({ teamNumber, scoreChange, changeType }) => {
  const [scoreChangeDisplay, setScoreChangeDisplay] = useState();
  const [scoreChangeVisible, setScoreChangeVisible] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    if (scoreChange < 0) {
      setScoreChangeDisplay(scoreChange);
      setScoreChangeVisible(true);
    } else if (scoreChange > 0) {
      setScoreChangeDisplay("+" + scoreChange);
      setScoreChangeVisible(true);
    } else {
      setScoreChangeVisible(false);
    }

    clearInterval(intervalRef.current);
    intervalRef.current = setTimeout(
      () => {
        setScoreChangeVisible(false);
      },
      changeType === "OpenPanel" ? 4000 : 6000
    );
  }, [scoreChange, changeType]);

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
};

export default TeamScoreChange;
