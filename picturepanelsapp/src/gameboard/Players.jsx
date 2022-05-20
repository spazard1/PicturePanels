import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./Players.css";

export default function Players({ players, turnType }) {
  return (
    <>
      <div className={classNames("teamPlayerNames", "teamOnePlayerNames", "hideIfEmpty", { welcomePlayerNames: turnType === "Welcome" })}>
        {Object.keys(players).map(
          (playerId) =>
            players[playerId].teamNumber === 1 && (
              <div
                key={playerId}
                className={classNames("teamPlayerName", "animate__animated", "animate__infinite", {
                  animate__pulse: !players[playerId].isReady,
                  teamOnePlayerNameNotReady: !players[playerId].isReady,
                })}
                style={{ borderColor: players[playerId].color }}
              >
                {players[playerId].name}
              </div>
            )
        )}
      </div>
      <div className={classNames("teamPlayerNames", "teamTwoPlayerNames", "hideIfEmpty", { welcomePlayerNames: turnType === "Welcome" })}>
        {Object.keys(players).map(
          (playerId) =>
            players[playerId].teamNumber === 2 && (
              <div
                key={playerId}
                className={classNames("teamPlayerName", "animate__animated", "animate__infinite", {
                  animate__pulse: !players[playerId].isReady,
                  teamTwoPlayerNameNotReady: !players[playerId].isReady,
                })}
                style={{ borderColor: players[playerId].color }}
              >
                {players[playerId].name}
              </div>
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
