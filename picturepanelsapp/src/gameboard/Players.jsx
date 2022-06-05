import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import AvatarName from "../avatars/AvatarName";
import Color from "color";
import "./Players.css";

export default function Players({ players, turnType }) {
  return (
    <>
      <div className={classNames("teamPlayerNames", "teamOnePlayerNames", "hideIfEmpty", { welcomePlayerNames: turnType === "Welcome" })}>
        {Object.keys(players).map(
          (playerId) =>
            players[playerId].teamNumber === 1 && (
              <AvatarName
                key={playerId}
                avatar={players[playerId].avatar}
                colors={players[playerId].colors.map((c) => Color(c))}
                name={players[playerId].name}
                className={classNames("teamPlayerNameContainer", "animate__animated", "animate__infinite", {
                  animate__pulse: !players[playerId].isReady,
                  teamOnePlayerNameNotReady: !players[playerId].isReady,
                })}
              />
            )
        )}
      </div>
      <div className={classNames("teamPlayerNames", "teamTwoPlayerNames", "hideIfEmpty", { welcomePlayerNames: turnType === "Welcome" })}>
        {Object.keys(players).map(
          (playerId) =>
            players[playerId].teamNumber === 2 && (
              <AvatarName
                key={playerId}
                avatar={players[playerId].avatar}
                colors={players[playerId].colors.map((c) => Color(c))}
                name={players[playerId].name}
                className={classNames("teamPlayerNameContainer", "animate__animated", "animate__infinite", {
                  animate__pulse: !players[playerId].isReady,
                  teamTwoPlayerNameNotReady: !players[playerId].isReady,
                })}
              />
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
