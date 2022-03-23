import React, { useEffect, useState } from "react";
import { useSelectedPanels } from "../common/useSelectedPanels";
import PlayerDot from "./PlayerDot";
import PropTypes from "prop-types";

import "./PlayerDots.css";

export default function PlayerDots({ panelRefs, players, teamTurn, turnType }) {
  const [playerDots, setPlayerDots] = useState({});
  const { selectedPanels } = useSelectedPanels(players);

  console.log(turnType, playerDots);

  useEffect(() => {
    console.log(panelRefs);

    const newPlayerDots = {};

    for (const playerId in selectedPanels) {
      if (players[playerId].teamNumber !== teamTurn) {
        continue;
      }

      newPlayerDots[playerId] = selectedPanels[playerId];
    }
    setPlayerDots(newPlayerDots);
  }, [panelRefs, players, teamTurn, selectedPanels]);

  return (
    <div id="playerDots">
      {Object.keys(playerDots).map((playerId) => (
        <span key={playerId}>
          {playerDots[playerId].map((panelNumber) => (
            <PlayerDot key={playerId + panelNumber} player={players[playerId]} panelRef={panelRefs[panelNumber - 1]} turnType={turnType}></PlayerDot>
          ))}
        </span>
      ))}
    </div>
  );
}

PlayerDots.propTypes = {
  panelRefs: PropTypes.arrayOf(PropTypes.object),
  players: PropTypes.object.isRequired,
  teamTurn: PropTypes.number.isRequired,
  turnType: PropTypes.string.isRequired,
};

//
