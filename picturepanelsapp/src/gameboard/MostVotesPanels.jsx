import React, { useEffect } from "react";
import MostVotesPanel from "./MostVotesPanel";
import PropTypes from "prop-types";

import "./MostVotesPanels.css";

const mostVotesPanels = [...Array(3).keys()].map((panelNumber) => panelNumber + 1 + "");

export default function MostVotesPanels(players) {
  useEffect(() => {}, [players]);

  return (
    <div id="mostVotesPanels">
      {mostVotesPanels.map((mostVotesPanelNumber) => (
        <MostVotesPanel key={mostVotesPanelNumber}></MostVotesPanel>
      ))}
    </div>
  );
}

MostVotesPanels.propTypes = {
  players: PropTypes.object.isRequired,
};
