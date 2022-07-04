import React from "react";
import PlayerDot from "./PlayerDot";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./PlayerDots.css";
import Avatar from "../../avatars/Avatar";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

export default function PlayerDots({ panelRefs, players, teamTurn, turnType }) {
  return (
    <>
      <div className={classNames("allPlayerDotsContainer", "teamOnePlayerDotsContainer")}>
        {Object.keys(players)?.map(
          (playerId) =>
            players[playerId] &&
            players[playerId].teamNumber === 1 && (
              <div key={playerId} className={classNames("playerDotsContainer")}>
                <Avatar
                  className={classNames("playerDotSpacingAvatar", "animate__animated", "animate__infinite", {
                    animate__pulse: !players[playerId].isReady && turnType !== "Welcome",
                  })}
                  avatar={players[playerId].avatar}
                  colors={players[playerId].colors}
                />
                {panelNumbers.map((panelNumber) => (
                  <PlayerDot
                    key={playerId + panelNumber}
                    avatar={players[playerId].avatar}
                    colors={players[playerId].colors}
                    panelRef={panelRefs[panelNumber - 1]}
                    isMoved={
                      turnType === "OpenPanel" &&
                      players[playerId].teamNumber === teamTurn &&
                      players[playerId].selectedPanels &&
                      players[playerId].selectedPanels.indexOf(panelNumber) >= 0
                    }
                  />
                ))}
                <div
                  className={classNames("playerNameContainer", "animate__animated", "animate__infinite", {
                    animate__pulse: !players[playerId].isReady && turnType !== "Welcome",
                  })}
                >
                  {players[playerId].name}
                </div>
              </div>
            )
        )}
      </div>
      <div className={classNames("allPlayerDotsContainer", "teamTwoPlayerDotsContainer")}>
        {Object.keys(players)?.map(
          (playerId) =>
            players[playerId] &&
            players[playerId].teamNumber === 2 && (
              <div key={playerId} className={classNames("playerDotsContainer")}>
                <Avatar
                  className={classNames("playerDotSpacingAvatar", "animate__animated", "animate__infinite", {
                    animate__pulse: !players[playerId].isReady && turnType !== "Welcome",
                  })}
                  avatar={players[playerId].avatar}
                  colors={players[playerId].colors}
                />
                {panelNumbers.map((panelNumber) => (
                  <PlayerDot
                    key={playerId + panelNumber}
                    avatar={players[playerId].avatar}
                    colors={players[playerId].colors}
                    panelRef={panelRefs[panelNumber - 1]}
                    isMoved={
                      turnType === "OpenPanel" &&
                      players[playerId].teamNumber === teamTurn &&
                      players[playerId].selectedPanels &&
                      players[playerId].selectedPanels.indexOf(panelNumber) >= 0
                    }
                  />
                ))}
                <div
                  className={classNames("playerNameContainer", "animate__animated", "animate__infinite", {
                    animate__pulse: !players[playerId].isReady && turnType !== "Welcome",
                  })}
                >
                  {players[playerId].name}
                </div>
              </div>
            )
        )}
      </div>
    </>
  );
}

PlayerDots.propTypes = {
  panelRefs: PropTypes.arrayOf(PropTypes.object),
  players: PropTypes.object.isRequired,
  teamTurn: PropTypes.number.isRequired,
  turnType: PropTypes.string,
};
