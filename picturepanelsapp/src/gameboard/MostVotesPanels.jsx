import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useSelectedPanels } from "../common/useSelectedPanels";

import "./MostVotesPanels.css";

const MaxMostVotesPanels = 3;

export default function MostVotesPanels({ panelRefs, players, teamTurn, turnType }) {
  const [mostVotesPanelsRects, setMostVotesPanelsRects] = useState([]);

  const { selectedPanels } = useSelectedPanels(players, turnType);

  useEffect(() => {
    const panelVotes = {};
    for (var i = 1; i <= 20; i++) {
      panelVotes[i] = 0;
    }

    for (const playerId in selectedPanels) {
      let playerSelectedPanels = selectedPanels[playerId];

      if (!players[playerId] || players[playerId].teamNumber !== teamTurn) {
        continue;
      }

      playerSelectedPanels.forEach((panel) => {
        panelVotes[panel]++;
      });
    }

    let mostVotes = 0;
    let mostVotesPanels = [];

    for (const panel in panelVotes) {
      var panelElement = document.getElementById("panel_" + panel);
      if (panelElement.classList.contains("panelOpen")) {
        continue;
      }

      if (panelVotes[panel] > mostVotes) {
        mostVotes = panelVotes[panel];
        mostVotesPanels = [panel];
      } else if (mostVotes > 0 && panelVotes[panel] === mostVotes) {
        mostVotesPanels.push(panel);
      }
    }

    if (mostVotesPanels.length > MaxMostVotesPanels) {
      mostVotesPanels = [];
    }

    while (mostVotesPanels.length < MaxMostVotesPanels) {
      mostVotesPanels.push(100 + mostVotesPanels.length);
    }

    let mostVotesPanelsRects = {};

    let key = 1;
    for (const panelNumber of mostVotesPanels) {
      if (panelNumber > 20) {
        mostVotesPanelsRects[key++] = { panelNumber: panelNumber, rect: panelRefs[7].current.getBoundingClientRect() };
      } else {
        mostVotesPanelsRects[key++] = { panelNumber: panelNumber, rect: panelRefs[panelNumber - 1].current.getBoundingClientRect() };
      }
    }

    setMostVotesPanelsRects(mostVotesPanelsRects);
  }, [panelRefs, players, teamTurn, selectedPanels]);

  return (
    <div id="mostVotesPanels">
      {Object.keys(mostVotesPanelsRects).map((key) => (
        <div
          key={key}
          className={classNames(
            "mostVotesPanel",
            { opacity0: parseInt(mostVotesPanelsRects[key].panelNumber) > 20 },
            { opacity0: turnType !== "OpenPanel" }
          )}
          style={{
            transform: "translate(" + mostVotesPanelsRects[key].rect.x + "px, " + mostVotesPanelsRects[key].rect.y + "px)",
            width: mostVotesPanelsRects[key].rect.width + "px",
            height: mostVotesPanelsRects[key].rect.height + "px",
          }}
        ></div>
      ))}
    </div>
  );
}

MostVotesPanels.propTypes = {
  panelRefs: PropTypes.arrayOf(PropTypes.object),
  players: PropTypes.object.isRequired,
  selectedPanels: PropTypes.object,
  teamTurn: PropTypes.number.isRequired,
  turnType: PropTypes.string,
};
