import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Avatar from "../../avatars/Avatar";

const PlayerDot = ({ avatar, colors, panelRef, isMoved }) => {
  const circleScale = 0.07;
  const divSize = window.innerHeight * circleScale;
  const playerDotContainerRef = useRef();
  const [originalRect, setOriginalRect] = useState();
  const [panelRect, setPanelRect] = useState();
  const [style, setStyle] = useState();
  const isOriginalRectSet = useRef(false);

  useEffect(() => {
    if (isOriginalRectSet.current) {
      return;
    }
    setOriginalRect(playerDotContainerRef.current.getBoundingClientRect());
    isOriginalRectSet.current = true;
  }, []);

  useEffect(() => {
    const panelRect = panelRef.current.getBoundingClientRect();
    setPanelRect({
      x: (panelRect.right - panelRect.left - divSize) * Math.random() + panelRect.left,
      y: (panelRect.bottom - panelRect.top - divSize) * Math.random() + panelRect.top,
    });
  }, [isMoved, divSize, panelRef]);

  useEffect(() => {
    if (!originalRect && !panelRect) {
      return;
    }

    if (!isMoved) {
      setStyle({ zIndex: Math.ceil(Math.random() * 500) + 100 });
      return;
    }

    const x = originalRect.x < panelRect.x ? Math.abs(originalRect.y - panelRect.y) : -(originalRect.x - panelRect.x);
    const y = originalRect.y < panelRect.y ? Math.abs(originalRect.y - panelRect.y) : -(originalRect.y - panelRect.y);

    setStyle({
      transform: "translate(" + x + "px, " + y + "px)",
      zIndex: Math.ceil(Math.random() * 500) + 100,
    });
  }, [originalRect, panelRect, isMoved]);

  return (
    <div style={style} className={classNames("playerDotContainer", { playerDotContainerMoved: isMoved })}>
      <Avatar ref={playerDotContainerRef} avatar={avatar} colors={colors} />
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

  if (preProps.panelRef !== newProps.panelRef) {
    return false;
  }

  if (preProps.isMoved !== newProps.isMoved) {
    return false;
  }

  return true;
};

PlayerDot.propTypes = {
  avatar: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  panelRef: PropTypes.object,
  isMoved: PropTypes.bool,
};

export default React.memo(PlayerDot, areEqual);
