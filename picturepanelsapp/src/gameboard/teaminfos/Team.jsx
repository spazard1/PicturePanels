import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Countdown from "./Countdown";
import TeamGuess from "./TeamGuess";
import "./Team.css";

const Team = ({
  teamName,
  teamIncorrectGuesses,
  teamInnerPanels,
  teamNumber,
  isTeamActive,
  isCountdownActive,
  isPaused,
  turnTime,
  turnTimeRemaining,
  teamGuessStatus,
  teamGuess,
  teamGuessIncorrect,
  turnType,
}) => {
  const [teamIncorrectGuessesDisplay, setTeamIncorrectGuessesDisplay] = useState();
  const intervalRef = useRef();

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (turnType === "GuessesMade") {
      intervalRef.current = setTimeout(() => {
        setTeamIncorrectGuessesDisplay(teamIncorrectGuesses);
      }, 8000);
    } else {
      setTeamIncorrectGuessesDisplay(teamIncorrectGuesses);
    }
  }, [turnType, teamIncorrectGuesses]);

  const renderPanelCount = useCallback(
    (n) => {
      return [...Array(5)].map((_, i) => (
        <div
          key={i}
          className={classNames("panelCount", "animate__animated", "animate__slow", {
            teamOneBox: teamNumber === 1,
            teamTwoBox: teamNumber === 2,
            animate__rollOut: i > n - 1,
          })}
        ></div>
      ));
    },
    [teamNumber]
  );

  const teamClassNames = classNames("teamInfo", "teamNameBox", { activeTeam: isTeamActive, teamOne: teamNumber === 1, teamTwo: teamNumber === 2 });

  return (
    <div className={teamClassNames}>
      {isCountdownActive && <Countdown isPaused={isPaused} turnTime={turnTime} turnTimeRemaining={turnTimeRemaining}></Countdown>}
      <div className="teamName">{teamName}</div>
      <div className="teamInfoIncorrectGuesses">
        {teamIncorrectGuessesDisplay <= 3 && [...Array(teamIncorrectGuessesDisplay)].map((_, i) => <span key={i}>⦻</span>)}
        {teamIncorrectGuessesDisplay > 3 && <>{teamIncorrectGuessesDisplay}⦻</>}
      </div>
      <div className="teamInfoPanelCounts center">{renderPanelCount(teamInnerPanels)}</div>
      <TeamGuess
        teamNumber={teamNumber}
        teamGuessStatus={teamGuessStatus}
        teamGuess={teamGuess}
        teamGuessIncorrect={teamGuessIncorrect}
        turnType={turnType}
      ></TeamGuess>
    </div>
  );
};

Team.propTypes = {
  teamName: PropTypes.string.isRequired,
  teamIncorrectGuesses: PropTypes.number.isRequired,
  teamInnerPanels: PropTypes.number.isRequired,
  teamNumber: PropTypes.number.isRequired,
  isTeamActive: PropTypes.bool.isRequired,
  isCountdownActive: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
  turnTime: PropTypes.number,
  turnTimeRemaining: PropTypes.number,
  teamGuessStatus: PropTypes.string,
  teamGuess: PropTypes.string,
  teamGuessIncorrect: PropTypes.bool,
  turnType: PropTypes.string,
};

export default Team;
