import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const PlayerDot = ({ player, panelRef, turnType }) => {
  const circleScale = 0.04;
  const divSize = window.innerHeight * circleScale;
  const circleBorderSize = 2;
  const circleSize = divSize / 2;
  const circleRadius = divSize / 2 - 2;

  let rect;
  if (panelRef) {
    const panelRect = panelRef.current.getBoundingClientRect();
    rect = {
      x: (panelRect.right - panelRect.left - divSize) * Math.random() + panelRect.left,
      y: (panelRect.bottom - panelRect.top - divSize) * Math.random() + panelRect.top,
    };
  } else {
    if (player.teamNumber === 1) {
      rect = { x: 0, y: 0 };
    } else {
      rect = { x: screen.width + divSize, y: 0 };
    }
  }

  return (
    <div
      id="playerDot_7de394af-2f2e-420b-93b8-e6829895811f_2"
      className={classNames("playerDot", { opacity0: turnType !== "OpenPanel" }, { opacity0: !panelRef })}
      style={{
        transform: "translate(" + rect.x + "px, " + rect.y + "px)",
        width: divSize + "px",
        height: divSize + "px",
        fill: player.color,
        zIndex: Math.ceil(Math.random() * 500) + 100,
      }}
    >
      <svg>
        <circle r={circleRadius} cx={circleSize} cy={circleSize} stroke="black" strokeWidth={circleBorderSize}></circle>
      </svg>
      <div id="playerDotInitials_7de394af-2f2e-420b-93b8-e6829895811f_2">in</div>
    </div>
  );
};

PlayerDot.propTypes = {
  player: PropTypes.object.isRequired,
  panelRef: PropTypes.object,
  turnType: PropTypes.string.isRequired,
};

export default React.memo(PlayerDot);
