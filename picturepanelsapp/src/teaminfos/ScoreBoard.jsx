import React from "react";
import PropTypes from "prop-types";
import "./ScoreBoard.css";

function ScoreBoard({ isTeamOnePlaying, teamOneScore, teamTwoScore, isGamePaused }) {
  return (
    <div className="scoreBoard">
      <div className="scoreTeam teamOneBox">{teamOneScore}</div>
      <div className="scoreBoardStatus">{isGamePaused ? "Game is paused" : isTeamOnePlaying ? "← Open a Panel" : "Open a Panel →"}</div>
      <div className="scoreTeam teamTwoBox">{teamTwoScore}</div>
    </div>
  );
}

ScoreBoard.propTypes = {
  isTeamOnePlaying: PropTypes.bool.isRequired,
  teamOneScore: PropTypes.number.isRequired,
  teamTwoScore: PropTypes.number.isRequired,
  isGamePaused: PropTypes.bool.isRequired,
};

export default ScoreBoard;
