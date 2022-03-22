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
          teamName={gameState.teamOneName}
          teamIncorrectGuesses={gameState.teamOneIncorrectGuesses}
          teamInnerPanels={gameState.teamOneInnerpanels}
          isTeamOne={true}
        />
        <ScoreBoard isGamePaused={false} isTeamOnePlaying={true} teamOneScore={gameState.teamOneScore} teamTwoScore={gameState.teamTwoScore} />
        <Team
          teamName={gameState.teamTwoName}
          teamIncorrectGuesses={gameState.teamTwoIncorrectGuesses}
          teamInnerPanels={gameState.teamTwoInnerPanels}
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
