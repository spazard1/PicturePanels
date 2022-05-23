import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./TeamGuess.css";

const TeamGuess = ({ teamNumber, teamGuessStatus, teamGuess, teamGuessIncorrect, turnType }) => {
  const [teamGuessDisplay, setTeamGuessDisplay] = useState();
  const [teamGuessVisible, setTeamGuessVisible] = useState(false);
  const [hasTeamGuessBeenVisible, setHasTeamGuessBeenVisible] = useState(false);
  const [teamGuessIncorrectDisplay, setTeamGuessIncorrectDisplay] = useState(false);
  const [readyDisplay, setReadyDisplay] = useState(true);
  const [skipReady, setSkipReady] = useState(false);

  useEffect(() => {
    if (turnType !== "MakeGuess" && turnType !== "GuessesMade") {
      setTeamGuessVisible(false);
      return;
    }

    if (teamGuessStatus === "Ready") {
      setTeamGuessVisible(true);
      setTeamGuessIncorrectDisplay(false);
      setTeamGuessDisplay("Ready!");
      setSkipReady(false);
    } else if (teamGuessStatus === "Guess") {
      setTeamGuessVisible(true);
      setTimeout(() => {
        setTeamGuessIncorrectDisplay(teamGuessIncorrect);
      }, 8000);
      setTeamGuessDisplay(teamGuess);
      setReadyDisplay(false);
      setSkipReady(false);
    } else if (teamGuessStatus === "Pass" || teamGuessStatus === "Skip") {
      setTeamGuessVisible(true);
      setTeamGuessIncorrectDisplay(false);
      setTeamGuessDisplay("(team passed)");
      setReadyDisplay(false);
      setSkipReady(false);
    } else if (teamGuessStatus === "BothSkip") {
      setTeamGuessVisible(true);
      setTeamGuessIncorrectDisplay(false);
      setTeamGuessDisplay("(team passed)");
      setReadyDisplay(false);
      setSkipReady(true);
    } else {
      setTeamGuessVisible(false);
      setTeamGuessIncorrectDisplay(false);
      setTimeout(() => {
        setReadyDisplay(true);
      }, 2000);
      setSkipReady(false);
    }
  }, [teamGuessStatus, teamGuess, turnType, teamGuessIncorrect]);

  useEffect(() => {
    if (teamGuessVisible) {
      setHasTeamGuessBeenVisible(true);
    }
  }, [teamGuessVisible]);

  return (
    <div
      className={classNames("teamGuess", "animate__animated", {
        teamOneBox: teamNumber === 1,
        teamTwoBox: teamNumber === 2,
        hidden: !hasTeamGuessBeenVisible,
        animate__backInDown: teamGuessVisible,
        animate__backOutUp: !teamGuessVisible,
        animate__slow: teamGuessVisible,
      })}
    >
      <div
        className={classNames("teamGuessChild", "animate__animated", "animate__slow", "animate__delay-4s", {
          hidden: skipReady,
          animate__fadeOut: !readyDisplay,
        })}
      >
        Ready!
      </div>
      <div
        className={classNames("teamGuessChild", "teamGuessReady", "animate__animated", "animate__delay-4s", {
          hidden: readyDisplay,
          animate__fadeIn: !readyDisplay && !skipReady,
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
