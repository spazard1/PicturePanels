import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const PlayerDot = ({ name, color, teamNumber, panelRef, turnType }) => {
  const [initials, setInitials] = useState("");
  const circleScale = 0.055;
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
    if (teamNumber === 1) {
      rect = { x: 0, y: 0 };
    } else {
      rect = { x: screen.width + divSize, y: 0 };
    }
  }

  useEffect(() => {
    if (!name) {
      return;
    }
    const spaceIndex = name.trim().indexOf(" ");
    if (spaceIndex > 0) {
      setInitials(name.charAt(0) + name.charAt(spaceIndex + 1));
    } else {
      setInitials(name.substring(0, 2));
    }
  }, [name]);

  return (
    <div
      className={classNames("playerDot", "animate__animated", { animate__fadeOut: turnType !== "OpenPanel" }, { animate__fadeOut: !panelRef })}
      style={{
        transform: "translate(" + rect.x + "px, " + rect.y + "px)",
        width: divSize + "px",
        height: divSize + "px",
        fill: color,
        zIndex: Math.ceil(Math.random() * 500) + 100,
      }}
    >
      <svg>
        <circle r={circleRadius} cx={circleSize} cy={circleSize} stroke="black" strokeWidth={circleBorderSize}></circle>
      </svg>
      <div>{initials}</div>
    </div>
  );
};

PlayerDot.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  teamNumber: PropTypes.number.isRequired,
  panelRef: PropTypes.object,
  turnType: PropTypes.string.isRequired,
};

export default React.memo(PlayerDot);
