import React, { useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Avatar from "../../avatars/Avatar";

const PlayerDot = ({ avatar, colors, teamNumber, panelRef, turnType }) => {
  const circleScale = 0.07;
  const divSize = window.innerHeight * circleScale;
  const hasBeenVisible = useRef(false);

  let rect;
  if (panelRef) {
    hasBeenVisible.current = true;
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

  return (
    <div
      className={classNames("playerDot", "animate__animated", {
        animate__fadeIn: turnType === "OpenPanel" && panelRef,
        animate__fadeOut: turnType !== "OpenPanel" || !panelRef,
        hidden: !hasBeenVisible.current,
      })}
      style={{
        transform: "translate(" + rect.x + "px, " + rect.y + "px)",
        width: divSize + "px",
        height: divSize + "px",
        zIndex: Math.ceil(Math.random() * 500) + 100,
      }}
    >
      <Avatar avatar={avatar} colors={colors}></Avatar>
    </div>
  );
};

const areEqual = (preProps, newProps) => {
  if (preProps.avatar != newProps.avatar) {
    return false;
  }

  if (preProps.colors.length !== newProps.colors.length) {
    return false;
  }

  for (let i = 0; i < preProps.colors.length; i++) {
    if (preProps.colors[i] !== newProps.colors[i]) {
      return false;
    }
  }

  if (preProps.teamNumber !== newProps.teamNumber) {
    return false;
  }

  if (preProps.panelRef !== newProps.panelRef) {
    return false;
  }

  if (preProps.turnType !== newProps.turnType) {
    return false;
  }

  return true;
};

PlayerDot.propTypes = {
  avatar: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  teamNumber: PropTypes.number.isRequired,
  panelRef: PropTypes.object,
  turnType: PropTypes.string.isRequired,
};

export default React.memo(PlayerDot, areEqual);
