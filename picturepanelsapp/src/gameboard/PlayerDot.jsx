import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

export default function PlayerDot({ player, panelRef, turnType }) {
  //className="playerDot_panelNumber_2 playerDot opacity0 playerDot_7de394af-2f2e-420b-93b8-e6829895811f"

  console.log(player, panelRef);

  const rect = panelRef.current.getBoundingClientRect();

  return (
    <div
      id="playerDot_7de394af-2f2e-420b-93b8-e6829895811f_2"
      className={classNames("playerDot", { opacity0: turnType !== "OpenPanel" })}
      style={{
        transform: "translate(" + rect.x + "px, " + rect.y + "px)",
        width: "50px",
        height: "50px",
        fill: player.color,
        zIndex: 300,
      }}
    >
      <svg>
        <circle r="24" cx="26" cy="26" stroke="black" strokeWidth="2"></circle>
      </svg>
      <div id="playerDotInitials_7de394af-2f2e-420b-93b8-e6829895811f_2">in</div>
    </div>
  );
}

PlayerDot.propTypes = {
  player: PropTypes.object.isRequired,
  panelRef: PropTypes.object.isRequired,
  turnType: PropTypes.string.isRequired,
};
