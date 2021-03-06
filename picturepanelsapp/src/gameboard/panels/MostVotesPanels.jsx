import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./MostVotesPanels.css";

const MaxMostVotesPanels = 3;

export default function MostVotesPanels({ panelRefs, revealedPanels, players, teamTurn, turnType }) {
  const [mostVotesPanelsRects, setMostVotesPanelsRects] = useState([]);
  const hasBeenVisible = useRef({ 1: false, 2: false, 3: false });

  useEffect(() => {
    const panelVotes = {};
    for (var i = 1; i <= 20; i++) {
      panelVotes[i] = 0;
    }

    for (const playerId in players) {
      let playerSelectedPanels = players[playerId].selectedPanels ?? [];

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
      if (revealedPanels.indexOf(panel) >= 0) {
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
        mostVotesPanelsRects[key] = { panelNumber: panelNumber, rect: panelRefs[7].current.getBoundingClientRect() };
      } else {
        mostVotesPanelsRects[key] = { panelNumber: panelNumber, rect: panelRefs[panelNumber - 1].current.getBoundingClientRect() };
        hasBeenVisible.current[key] = true;
      }
      key++;
    }

    setMostVotesPanelsRects(mostVotesPanelsRects);
  }, [panelRefs, revealedPanels, players, teamTurn]);

  return (
    <div className="mostVotesPanels">
      {Object.keys(mostVotesPanelsRects).map((key) => (
        <div
          key={key}
          className={classNames("mostVotesPanel", "animate__animated", key, {
            animate__fadeOut: parseInt(mostVotesPanelsRects[key].panelNumber) > 20 || turnType !== "OpenPanel",
            animate__fadeIn: parseInt(mostVotesPanelsRects[key].panelNumber) <= 20 && turnType === "OpenPanel",
            hidden: !hasBeenVisible.current[key],
          })}
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
  revealedPanels: PropTypes.arrayOf(PropTypes.string),
  players: PropTypes.object.isRequired,
  selectedPanels: PropTypes.object,
  teamTurn: PropTypes.number.isRequired,
  turnType: PropTypes.string,
};
