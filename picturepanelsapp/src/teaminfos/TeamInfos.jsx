import React from "react";
import Team from "./Team";
import ScoreBoard from "./ScoreBoard";
import "./TeamInfos.css";
import PropTypes from "prop-types";

function TeamInfos({ gameState }) {
  return (
    <>
      <div className="teamInfos">
        <Team
          teamName={gameState.teamOneName ?? "Team 1"}
          teamIncorrectGuesses={gameState.teamOneIncorrectGuesses ?? 0}
          teamInnerPanels={gameState.teamOneInnerPanels ?? 5}
          isTeamActive={gameState.teamTurn === 1 ? true : false}
          isTeamOne={true}
        />
        <ScoreBoard
          isGamePaused={false}
          isTeamOnePlaying={true}
          teamOneScore={gameState.teamOneScore ?? 0}
          teamTwoScore={gameState.teamTwoScore ?? 0}
        />
        <Team
          teamName={gameState.teamTwoName ?? "Team 2"}
          teamIncorrectGuesses={gameState.teamTwoIncorrectGuesses ?? 0}
          teamInnerPanels={gameState.teamTwoInnerPanels ?? 5}
          isTeamActive={gameState.teamTurn === 2 ? true : false}
          isTeamOne={false}
        />
      </div>
    </>
  );
}

TeamInfos.propTypes = {
  gameState: PropTypes.object.isRequired,
};

export default TeamInfos;
