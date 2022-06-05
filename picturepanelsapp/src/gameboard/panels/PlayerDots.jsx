import React from "react";
import { useSelectedPanels } from "../../common/useSelectedPanels";
import PlayerDot from "./PlayerDot";
import PropTypes from "prop-types";
import classNames from "classnames";
import Avatar from "../../avatars/Avatar";
import Color from "color";

import "./PlayerDots.css";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

export default function PlayerDots({ panelRefs, players, teamTurn, turnType }) {
  const { selectedPanels } = useSelectedPanels(players, turnType);

  return (
    <>
      <div className={classNames("allPlayerDotsContainer", "teamOnePlayerDotsContainer")}>
        {Object.keys(players).map(
          (playerId) =>
            players[playerId] &&
            players[playerId].teamNumber === 1 && (
              <div key={playerId} className={classNames("playerDotsContainer", { teamOnePlayerNameNotReady: !players[playerId].isReady })}>
                <div className="hidden">
                  <Avatar avatar={players[playerId].avatar} colors={players[playerId].colors.map((c) => Color(c))}></Avatar>
                </div>
                {panelNumbers.map((panelNumber) => (
                  <PlayerDot
                    key={playerId + panelNumber}
                    avatar={players[playerId].avatar}
                    colors={players[playerId].colors}
                    panelRef={panelRefs[panelNumber - 1]}
                    isMoved={
                      turnType === "OpenPanel" &&
                      players[playerId].teamNumber === teamTurn &&
                      selectedPanels[playerId] &&
                      selectedPanels[playerId].indexOf(panelNumber) >= 0
                    }
                  />
                ))}
                <div className="playerNameContainer hidden">{players[playerId].name}</div>
              </div>
            )
        )}
      </div>
      <div className={classNames("allPlayerDotsContainer", "teamTwoPlayerDotsContainer")}>
        {Object.keys(players).map(
          (playerId) =>
            players[playerId] &&
            players[playerId].teamNumber === 2 && (
              <div key={playerId} className={classNames("playerDotsContainer", { teamTwoPlayerNameNotReady: !players[playerId].isReady })}>
                <div className="hidden">
                  <Avatar avatar={players[playerId].avatar} colors={players[playerId].colors.map((c) => Color(c))}></Avatar>
                </div>
                {panelNumbers.map((panelNumber) => (
                  <PlayerDot
                    key={playerId + panelNumber}
                    avatar={players[playerId].avatar}
                    colors={players[playerId].colors}
                    panelRef={panelRefs[panelNumber - 1]}
                    isMoved={
                      turnType === "OpenPanel" &&
                      players[playerId].teamNumber === teamTurn &&
                      selectedPanels[playerId] &&
                      selectedPanels[playerId].indexOf(panelNumber) >= 0
                    }
                  />
                ))}
                <div className="playerNameContainer hidden">{players[playerId].name}</div>
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
