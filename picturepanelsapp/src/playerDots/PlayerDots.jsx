import React, { useEffect, useState } from "react";
import { useSelectedPanels } from "../common/useSelectedPanels";
import PlayerDot from "./PlayerDot";
import PropTypes from "prop-types";

import "./PlayerDots.css";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

export default function PlayerDots({ panelRefs, players, teamTurn, turnType }) {
  const [playerDots, setPlayerDots] = useState({});
  const { selectedPanels } = useSelectedPanels(players, turnType);

  useEffect(() => {
    const newPlayerDots = {};

    for (const playerId in selectedPanels) {
      if (!players[playerId] || players[playerId].teamNumber !== teamTurn) {
        continue;
      }

      newPlayerDots[playerId] = selectedPanels[playerId];
    }
    setPlayerDots(newPlayerDots);
  }, [panelRefs, players, teamTurn, selectedPanels]);

  return (
    <div className="playerDots">
      {Object.keys(playerDots).map((playerId) => (
        <span key={playerId}>
          {players[playerId] &&
            panelNumbers.map((panelNumber) => (
              <PlayerDot
                key={playerId + panelNumber}
                name={players[playerId].name}
                dot={players[playerId].dot}
                colors={players[playerId].colors}
                teamNumber={players[playerId].teamNumber}
                panelRef={playerDots[playerId].indexOf(panelNumber) >= 0 ? panelRefs[panelNumber - 1] : null}
                turnType={turnType}
              ></PlayerDot>
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
  turnType: PropTypes.string,
};
