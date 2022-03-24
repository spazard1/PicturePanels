import React from "react";
import Team from "./Team";
import ScoreBoard from "./ScoreBoard";
import PropTypes from "prop-types";
import "./TeamInfos.css";

function TeamInfos({ gameState }) {
  return (
    <>
      <div className="teamInfos">
        <Team
          teamName={gameState.teamOneName ?? "Team 1"}
          teamIncorrectGuesses={gameState.teamOneIncorrectGuesses ?? 0}
          teamInnerPanels={gameState.teamOneInnerPanels ?? 5}
          isTeamActive={gameState.teamTurn === 1 ? true : false}
          isCountdownActive={
            (gameState.turnType === "OpenPanel" && gameState.teamTurn === 1) || (gameState.turnType === "MakeGuess" && !gameState.teamOneGuessStatus)
          }
          teamNumber={1}
          isPaused={gameState.pauseState === "Paused"}
          turnTime={gameState.turnTime}
          turnTimeTotal={gameState.turnTimeTotal}
          turnTimeRemaining={gameState.turnTimeRemaining}
          pauseTurnRemainingTime={gameState.pauseTurnRemainingTime}
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
          isCountdownActive={
            (gameState.turnType === "OpenPanel" && gameState.teamTurn === 2) || (gameState.turnType === "MakeGuess" && !gameState.teamTwoGuessStatus)
          }
          teamNumber={2}
          isPaused={gameState.pauseState === "Paused"}
          turnTime={gameState.turnTime}
          turnTimeTotal={gameState.turnTimeTotal}
          turnTimeRemaining={gameState.turnTimeRemaining}
          pauseTurnRemainingTime={gameState.pauseTurnRemainingTime}
        />
      </div>
    </>
  );
}

TeamInfos.propTypes = {
  gameState: PropTypes.object.isRequired,
};

export default TeamInfos;
