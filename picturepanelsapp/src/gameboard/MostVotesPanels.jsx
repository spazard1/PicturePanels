import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import "./MostVotesPanels.css";

const MaxMostVotesPanels = 3;

export default function MostVotesPanels({ panelRefs, players }) {
  const [mostVotesPanelsRects, setMostVotesPanelsRects] = useState([]);

  useEffect(() => {
    console.log(panelRefs[1].current.src);

    console.log(panelRefs[1].current.getBoundingClientRect().height);

    const panelVotes = {};
    for (var i = 1; i <= 20; i++) {
      panelVotes[i + ""] = 0;
    }

    for (const playerId in players) {
      let player = players[playerId];

      if (player === 0) {
        continue;
      }

      player.selectedPanels.forEach((panel) => {
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
      } else if (panelVotes[panel] === mostVotes) {
        mostVotesPanels.push(panel);
      }
    }

    while (mostVotesPanels.length < MaxMostVotesPanels) {
      mostVotesPanels.push(20 + mostVotesPanels.length);
    }

    let mostVotesPanelsRects = {};

    for (const panelNumber in mostVotesPanels) {
      if (panelNumber > 20) {
        mostVotesPanelsRects[panelNumber] = null;
      } else {
        mostVotesPanelsRects[panelNumber] = panelRefs[panelNumber].current.getBoundingClientRect();
      }
    }

    console.log(mostVotesPanelsRects);

    setMostVotesPanelsRects(mostVotesPanelsRects);
  }, [panelRefs, players]);

  return (
    <div id="mostVotesPanels">
      {Object.keys(mostVotesPanelsRects).map((panelNumber) => (
        <>
          {panelNumber > 20 && (
            <div
              key={panelNumber}
              className="mostVotesPanel opacity0"
              style="transform: translate(753.927px, 528.302px); width: 300.125px; height: 212.583px;"
            ></div>
          )}
          {panelNumber <= 20 && (
            <div
              key={panelNumber}
              className="mostVotesPanel"
              style={
                "transform: translate(" +
                mostVotesPanelsRects[panelNumber].x +
                "px, " +
                mostVotesPanelsRects[panelNumber].y +
                "px); " +
                "width: " +
                mostVotesPanelsRects[panelNumber].width +
                "px; height: " +
                mostVotesPanelsRects[panelNumber].height +
                "px;"
              }
            ></div>
          )}
        </>
      ))}
    </div>
  );
}

MostVotesPanels.propTypes = {
  panelRefs: PropTypes.arrayOf(PropTypes.object),
  players: PropTypes.object.isRequired,
};
