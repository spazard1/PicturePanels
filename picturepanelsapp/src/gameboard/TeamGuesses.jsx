import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./TeamGuesses.css";

const TeamGuesses = ({ teamOneGuess, teamOneGuessStatus, teamOneCorrect, teamTwoGuess, teamTwoGuessStatus, teamTwoCorrect, turnType }) => {
  const [teamGuessesVisible, setTeamGuessesVisible] = useState(false);
  const [hasTeamGuessBeenVisible, setHasTeamGuessBeenVisible] = useState(false);
  const [teamOneGuessIncorrectDisplay, setTeamOneGuessIncorrectDisplay] = useState(false);
  const [teamTwoGuessIncorrectDisplay, setTeamTwoGuessIncorrectDisplay] = useState(false);

  useEffect(() => {
    if (turnType !== "GuessesMade") {
      setTeamGuessesVisible(false);

      return;
    }

    setTeamGuessesVisible(true);

    if (teamOneGuessStatus === "Skip" && teamTwoGuessStatus === "Skip") {
      console.log("todo");
    }

    if (teamOneGuessStatus === "Guess") {
      setTeamOneGuessIncorrectDisplay(false);
      setTimeout(() => {
        setTeamOneGuessIncorrectDisplay(!teamOneCorrect);
      }, 8000);
    }

    if (teamTwoGuessStatus === "Guess") {
      setTeamOneGuessIncorrectDisplay(false);
      setTimeout(() => {
        setTeamTwoGuessIncorrectDisplay(!teamTwoCorrect);
      }, 8000);
    }
  }, [teamOneGuessStatus, teamOneCorrect, teamTwoGuessStatus, teamTwoCorrect, turnType]);

  useEffect(() => {
    if (teamGuessesVisible) {
      setHasTeamGuessBeenVisible(true);
    }
  }, [teamGuessesVisible]);

  return (
    <>
      <div
        className={classNames("teamGuess", "animate__animated", "teamOneBox", "teamGuessTeamOne", {
          hidden: !hasTeamGuessBeenVisible,
          animate__slideInLeft: teamGuessesVisible,
          animate__slideOutLeft: !teamGuessesVisible,
          teamGuessIncorrect: teamOneGuessIncorrectDisplay,
        })}
      >
        {teamOneGuessStatus === "Pass" || teamOneGuessStatus === "Skip" ? "(team passed)" : teamOneGuess}
      </div>
      <div
        className={classNames("teamGuess", "animate__animated", "teamTwoBox", "teamGuessTeamTwo", {
          hidden: !hasTeamGuessBeenVisible,
          animate__slideInRight: teamGuessesVisible,
          animate__slideOutRight: !teamGuessesVisible,
          teamGuessIncorrect: teamTwoGuessIncorrectDisplay,
        })}
      >
        {teamTwoGuessStatus === "Pass" || teamTwoGuessStatus === "Skip" ? "(team passed)" : teamTwoGuess}
      </div>
    </>
  );
};

export default TeamGuesses;

TeamGuesses.propTypes = {
  teamOneGuess: PropTypes.string,
  teamOneGuessStatus: PropTypes.string,
  teamOneCorrect: PropTypes.string,
  teamTwoGuess: PropTypes.string,
  teamTwoGuessStatus: PropTypes.string,
  teamTwoCorrect: PropTypes.string,
  turnType: PropTypes.string,
};
