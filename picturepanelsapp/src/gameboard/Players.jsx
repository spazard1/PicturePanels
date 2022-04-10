import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./Players.css";

export default function Players({ players, turnType }) {
  const teamOneClassNames = classNames("teamPlayerNames", "teamOnePlayerNames", "hideIfEmpty", { welcomePlayerNames: turnType === "Welcome" });
  const teamTwoClassNames = classNames("teamPlayerNames", "teamTwoPlayerNames", "hideIfEmpty", { welcomePlayerNames: turnType === "Welcome" });

  console.log(turnType);

  const teamOnePlayers = {};
  const teamTwoPlayers = {};

  for (const playerId in players) {
    if (players[playerId].teamNumber === 1) {
      teamOnePlayers[playerId] = players[playerId];
    } else {
      teamTwoPlayers[playerId] = players[playerId];
    }
  }

  return (
    <>
      <div className={teamOneClassNames}>
        {Object.keys(teamOnePlayers).map((playerId) =>
          players[playerId].teamNumber === 1 ? (
            <div key={playerId} className="teamPlayerName" style={{ borderColor: players[playerId].color }}>
              {players[playerId].name}
            </div>
          ) : (
            <></>
          )
        )}
      </div>
      <div className={teamTwoClassNames}>
        {Object.keys(teamTwoPlayers).map((playerId) =>
          players[playerId].teamNumber === 2 ? (
            <div key={playerId} className="teamPlayerName" style={{ borderColor: players[playerId].color }}>
              {players[playerId].name}
            </div>
          ) : (
            <></>
          )
        )}
      </div>
    </>
  );
}

Players.propTypes = {
  players: PropTypes.object,
  turnType: PropTypes.string,
};
