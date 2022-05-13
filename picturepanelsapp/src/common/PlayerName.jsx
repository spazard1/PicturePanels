import React from "react";
import PropTypes from "prop-types";

import "./PlayerName.css";

const PlayerName = ({ player }) => {
  return (
    <span className="playerName" style={{ color: player.color }}>
      {player.name}
    </span>
  );
};

export default PlayerName;

PlayerName.propTypes = {
  player: PropTypes.object,
};
