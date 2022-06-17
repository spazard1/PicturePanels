import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./TeamGuesses.css";

const TeamGuesses = ({
  teamOneGuess,
  teamOneGuessStatus,
  teamOneCorrect,
  teamTwoGuess,
  teamTwoGuessStatus,
  teamTwoCorrect,
  turnType,
  playCorrectSound,
  playIncorrectSound,
  playBothTeamsPassSound,
}) => {
  const [teamGuessesVisible, setTeamGuessesVisible] = useState(false);
  const [hasTeamGuessBeenVisible, setHasTeamGuessBeenVisible] = useState(false);
  const [teamOneGuessCorrectDisplay, setTeamOneGuessCorrectDisplay] = useState("");
  const [teamTwoGuessCorrectDisplay, setTeamTwoGuessCorrectDisplay] = useState("");
  const [teamOneGuessTextDisplay, setTeamOneGuessTextDisplay] = useState("");
  const [teamTwoGuessTextDisplay, setTeamTwoGuessTextDisplay] = useState("");
  const [isTeamGuessCorrect, setIsTeamGuessCorrect] = useState("");
  const [bothTeamsPass, setBothTeamsPass] = useState(false);

  useEffect(() => {
    if (turnType !== "GuessesMade") {
      setTeamGuessesVisible(false);
      return;
    }

    if (teamOneGuessStatus === "Pass" || teamOneGuessStatus === "Skip") {
      setTeamOneGuessTextDisplay("(team passed)");
    } else {
      setTeamOneGuessTextDisplay(teamOneGuess);
    }

    if (teamTwoGuessStatus === "Pass" || teamTwoGuessStatus === "Skip") {
      setTeamTwoGuessTextDisplay("(team passed)");
    } else {
      setTeamTwoGuessTextDisplay(teamTwoGuess);
    }

    setTeamGuessesVisible(true);
    setIsTeamGuessCorrect(false);
    setTeamOneGuessCorrectDisplay("");
    setTeamTwoGuessCorrectDisplay("");

    if ((teamOneGuessStatus === "Pass" || teamOneGuessStatus === "Skip") && (teamTwoGuessStatus === "Pass" || teamTwoGuessStatus === "Skip")) {
      playBothTeamsPassSound();
      setBothTeamsPass(true);
      return;
    }
    setBothTeamsPass(false);

    setTimeout(() => {
      setTeamOneGuessCorrectDisplay(teamOneCorrect ? "Correct" : teamOneGuessStatus === "Guess" ? "Incorrect" : "");
      setTeamTwoGuessCorrectDisplay(teamTwoCorrect ? "Correct" : teamTwoGuessStatus === "Guess" ? "Incorrect" : "");
      setIsTeamGuessCorrect(teamOneCorrect || teamTwoCorrect);
      if (teamOneCorrect || teamTwoCorrect) {
        playCorrectSound();
      } else if (teamOneGuessStatus === "Guess" || teamTwoGuessStatus === "Guess") {
        playIncorrectSound();
      }
    }, 7000);
  }, [
    teamOneGuess,
    teamOneGuessStatus,
    teamOneCorrect,
    teamTwoGuess,
    teamTwoGuessStatus,
    teamTwoCorrect,
    turnType,
    playCorrectSound,
    playIncorrectSound,
    playBothTeamsPassSound,
  ]);

  useEffect(() => {
    if (teamGuessesVisible) {
      setHasTeamGuessBeenVisible(true);
    }
  }, [teamGuessesVisible]);

  return (
    <>
      {bothTeamsPass && (
        <div
          className={classNames("bothTeamsPass", "animate__animated", {
            hidden: !hasTeamGuessBeenVisible,
            animate__zoomIn: teamGuessesVisible,
            animate__zoomOut: !teamGuessesVisible,
          })}
        >
          Both Teams Pass
        </div>
      )}
      {!bothTeamsPass && (
        <>
          <div
            className={classNames("teamGuess", "animate__animated", "teamOneBox", "teamGuessTeamOne", {
              hidden: !hasTeamGuessBeenVisible,
              animate__slideInLeft: teamGuessesVisible && teamOneGuessCorrectDisplay === "",
              animate__slideOutLeft: !teamGuessesVisible,
              teamGuessCorrect: teamOneGuessCorrectDisplay === "Correct",
              teamGuessIncorrect: teamOneGuessCorrectDisplay === "Incorrect",
              animate__pulse: teamOneGuessCorrectDisplay === "Correct" && teamGuessesVisible,
              "animate__delay-1s": teamOneGuessCorrectDisplay === "Correct" && teamGuessesVisible,
              "animate__repeat-5": teamOneGuessCorrectDisplay === "Correct" && teamGuessesVisible,
              teamGuessCorrectTeamOne: isTeamGuessCorrect,
            })}
          >
            {teamOneGuessTextDisplay}
          </div>
          <div
            className={classNames("teamGuess", "animate__animated", "teamTwoBox", "teamGuessTeamTwo", {
              hidden: !hasTeamGuessBeenVisible,
              animate__slideInRight: teamGuessesVisible && teamTwoGuessCorrectDisplay === "",
              animate__slideOutRight: !teamGuessesVisible,
              teamGuessCorrect: teamTwoGuessCorrectDisplay === "Correct",
              teamGuessIncorrect: teamTwoGuessCorrectDisplay === "Incorrect",
              animate__pulse: teamTwoGuessCorrectDisplay === "Correct" && teamGuessesVisible,
              "animate__delay-1s": teamTwoGuessCorrectDisplay === "Correct" && teamGuessesVisible,
              "animate__repeat-5": teamTwoGuessCorrectDisplay === "Correct" && teamGuessesVisible,
              teamGuessCorrectTeamTwo: isTeamGuessCorrect,
            })}
          >
            {teamTwoGuessTextDisplay}
          </div>
        </>
      )}
    </>
  );
};

export default TeamGuesses;

TeamGuesses.propTypes = {
  teamOneGuess: PropTypes.string,
  teamOneGuessStatus: PropTypes.string,
  teamOneCorrect: PropTypes.bool,
  teamTwoGuess: PropTypes.string,
  teamTwoGuessStatus: PropTypes.string,
  teamTwoCorrect: PropTypes.bool,
  turnType: PropTypes.string,
  playCorrectSound: PropTypes.func,
  playIncorrectSound: PropTypes.func,
  playBothTeamsPassSound: PropTypes.func,
};
