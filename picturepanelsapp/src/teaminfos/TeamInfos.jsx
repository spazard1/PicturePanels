import React from "react";
import Team from "./Team";
import ScoreBoard from "./ScoreBoard";
import "./TeamInfos.css";

function TeamInfos() {
  return (
    <>
      <div className="teamInfos">
        <Team
          teamName="Team1"
          teamIncorrectGuesses={2}
          teamInnerPanels={2}
          isTeamOne={true}
        />
        <ScoreBoard
          isGamePaused={false}
          isTeamOnePlaying={true}
          teamOneScore={3}
          teamTwoScore={2}
        />
        <Team
          teamName="Team2"
          teamIncorrectGuesses={3}
          teamInnerPanels={4}
          isTeamOne={false}
        />
      </div>
    </>
  );
}

export default TeamInfos;
