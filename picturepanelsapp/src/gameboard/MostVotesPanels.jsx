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
      panelVotes[i] = 0;
    }

    for (const playerId in players) {
      let player = players[playerId];

      if (player.teamNumber === 0) {
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

    for (const panelNumber of mostVotesPanels) {
      if (panelNumber > 20) {
        mostVotesPanelsRects[panelNumber] = panelRefs[0].current.getBoundingClientRect();
      } else {
        mostVotesPanelsRects[panelNumber] = panelRefs[panelNumber - 1].current.getBoundingClientRect();
      }
    }

    console.log(mostVotesPanels);
    console.log(mostVotesPanelsRects);

    setMostVotesPanelsRects(mostVotesPanelsRects);
  }, [panelRefs, players]);

  return (
    <div id="mostVotesPanels">
      {Object.keys(mostVotesPanelsRects).map((panelNumber) =>
        parseInt(panelNumber) > 20 ? (
          <div key={panelNumber} className="mostVotesPanel opacity0"></div>
        ) : (
          <div
            key={panelNumber}
            className="mostVotesPanel"
            style={{
              transform: "translate(100px, 100px)",
              width: "100px",
              height: "100px",
            }}
          ></div>
        )
      )}
    </div>
  );
}

MostVotesPanels.propTypes = {
  panelRefs: PropTypes.arrayOf(PropTypes.object),
  players: PropTypes.object.isRequired,
};

/*
          parseInt(panelNumber) > 20 ?
            <div key={panelNumber} className="mostVotesPanel opacity0"></div>
          :
            <div
              key={panelNumber}
              className="mostVotesPanel"
              style={
                {
                  transform: "translate(" + mostVotesPanelsRects[panelNumber].x + "px, " + mostVotesPanelsRects[panelNumber].y + "px)",
                  width: mostVotesPanelsRects[panelNumber].width + "px",
                  height: mostVotesPanelsRects[panelNumber].height + "px"
                }
              }
            ></div>
            */
