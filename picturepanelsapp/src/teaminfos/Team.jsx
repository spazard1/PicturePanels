import React, { useCallback } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Countdown from "./Countdown";
import "./Team.css";

function Team({
  teamName,
  teamIncorrectGuesses,
  teamInnerPanels,
  teamNumber,
  isTeamActive,
  isPaused,
  turnTime,
  turnTimeTotal,
  turnTimeRemaining,
  pauseTurnRemainingTime,
}) {
  const panelCountClassNames = classNames("panelCount", { teamOneBox: teamNumber === 1, teamTwoBox: teamNumber === 2 });
  const renderPanelCount = useCallback((n) => {
    return [...Array(n)].map((_, i) => <div key={i} className={panelCountClassNames}></div>);
  }, []);

  const renderIncorrectGuesses = useCallback((n) => {
    return [...Array(n)].map((_, i) => (
      <div key={i} className="teamInfoIncorrectGuesses">
        ⦻
      </div>
    ));
  }, []);

  const teamClassNames = classNames("teamInfo", "teamNameBox", { activeTeam: isTeamActive, teamOne: teamNumber === 1, teamTwo: teamNumber === 2 });

  return (
    <div className={teamClassNames}>
      <Countdown
        isPaused={isPaused}
        turnTime={turnTime}
        turnTimeTotal={turnTimeTotal}
        turnTimeRemaining={turnTimeRemaining}
        pauseTurnRemainingTime={pauseTurnRemainingTime}
      ></Countdown>
      <div className="teamName">{teamName}</div>
      <div className="teamInfoIncorrectGuesses">{renderIncorrectGuesses(teamIncorrectGuesses)}</div>
      <div className="teamInfoPanelCounts center">{renderPanelCount(teamInnerPanels)}</div>
    </div>
  );
}

Team.propTypes = {
  teamName: PropTypes.string.isRequired,
  teamIncorrectGuesses: PropTypes.number.isRequired,
  teamInnerPanels: PropTypes.number.isRequired,
  teamNumber: PropTypes.number.isRequired,
  isTeamActive: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
  turnTime: PropTypes.number.isRequired,
  turnTimeTotal: PropTypes.number.isRequired,
  turnTimeRemaining: PropTypes.number.isRequired,
  pauseTurnRemainingTime: PropTypes.number,
};

export default Team;
