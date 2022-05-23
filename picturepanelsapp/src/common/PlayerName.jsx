import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./PlayerName.css";

const PlayerName = ({ player, className }) => {
  return (
    <span className={classNames("playerName", className)} style={{ color: player.color }}>
      {player.name}
    </span>
  );
};

export default PlayerName;

PlayerName.propTypes = {
  player: PropTypes.object,
  className: PropTypes.string,
};
