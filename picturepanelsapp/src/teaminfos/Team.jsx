import React, { useCallback } from "react";
import PropTypes from "prop-types";
import "./Team.css";

function Team({ teamName, teamIncorrectGuesses, teamInnerPanels, isTeamOne, isTeamActive }) {
  const renderPanelCount = useCallback((n) => {
    return [...Array(n)].map((_, i) => <div key={i} className={`panelCount ${isTeamOne ? "teamOneBox" : "teamTwoBox"}`}></div>);
  }, []);

  const renderIncorrectGuesses = useCallback((n) => {
    return [...Array(n)].map((_, i) => (
      <div key={i} className="teamInfoIncorrectGuesses">
        ⦻
      </div>
    ));
  }, []);

  return (
    <div className={`teamInfo teamNameBox ${isTeamActive ? "activeTeam" : ""}`}>
      <div className="teamName">{teamName}</div>
      <div className="teamInfoBottomContainer">
        <div className="teamInfoIncorrectGuessesContainer">{renderIncorrectGuesses(teamIncorrectGuesses)}</div>
        <div className="teamInfoPanelCounts">{renderPanelCount(teamInnerPanels)}</div>
      </div>
    </div>
  );
}

Team.propTypes = {
  teamName: PropTypes.string.isRequired,
  teamIncorrectGuesses: PropTypes.number.isRequired,
  teamInnerPanels: PropTypes.number.isRequired,
  isTeamOne: PropTypes.bool.isRequired,
  isTeamActive: PropTypes.bool.isRequired,
};

export default Team;
