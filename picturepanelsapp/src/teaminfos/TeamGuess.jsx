import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./TeamGuess.css";

const TeamGuess = ({ teamNumber, teamGuessStatus, teamGuess, teamGuessIncorrect, turnType }) => {
  const [teamGuessDisplay, setteamGuessDisplay] = useState();
  const [teamGuessVisible, setTeamGuessVisible] = useState(false);
  const [teamGuessIncorrectDisplay, setTeamGuessIncorrectDisplay] = useState(false);

  // const intervalRef = useRef();

  useEffect(() => {
    if (turnType !== "MakeGuess" && turnType !== "GuessesMade") {
      setTeamGuessVisible(false);
      return;
    }

    if (teamGuessStatus === "Ready") {
      setTeamGuessVisible(true);
      setTeamGuessIncorrectDisplay(false);
      setteamGuessDisplay("Ready!");
    } else if (teamGuessStatus === "Guess") {
      setTeamGuessVisible(true);
      setTeamGuessIncorrectDisplay(teamGuessIncorrect);
      setteamGuessDisplay(teamGuess);
    } else if (teamGuessStatus) {
      setTeamGuessVisible(true);
      setTeamGuessIncorrectDisplay(false);
      setteamGuessDisplay("(team passed)");
    } else {
      setTeamGuessVisible(false);
      setTeamGuessIncorrectDisplay(false);
    }

    //clearInterval(intervalRef.current);
    //intervalRef.current = setTimeout(() => {
    //  setScoreChangeVisible(false);
    //}, changeType === "OpenPanel" ? 4000 : 6000);
  }, [teamGuessStatus, teamGuess, turnType, teamGuessIncorrect]);

  return (
    <div
      className={classNames("teamGuess", "hideIfEmpty", "animate__animated", {
        teamOneBox: teamNumber === 1,
        teamTwoBox: teamNumber === 2,
        animate__bounceInDown: teamGuessVisible,
        animate__bounceOutUp: !teamGuessVisible,
        animate__slow: teamGuessVisible,
      })}
    >
      <div className={classNames("teamGuessChild", "hideIfEmpty", "animate__animated", { opacity0: teamGuessStatus !== "Ready" })}>Ready!</div>
      <div
        className={classNames("teamGuessReady", "teamGuessChild", "hideIfEmpty", "animate__animated", {
          opacity0: teamGuessStatus === "Ready",
          teamGuessIncorrect: teamGuessIncorrectDisplay,
        })}
      >
        {teamGuessDisplay}
      </div>
    </div>
  );
};

export default TeamGuess;

TeamGuess.propTypes = {
  teamNumber: PropTypes.number.isRequired,
  teamGuessStatus: PropTypes.string,
  teamGuess: PropTypes.string,
  teamGuessIncorrect: PropTypes.bool,
  turnType: PropTypes.string,
};
