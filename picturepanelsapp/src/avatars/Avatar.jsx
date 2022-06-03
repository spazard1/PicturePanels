import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import AllAvatars from "./AllAvatars";
import "./Avatar.css";
import classNames from "classnames";

const Avatar = ({ avatar, colors, className }, ref) => {
  const AvatarHelper = AllAvatars[avatar];

  return (
    <div ref={ref} className={classNames("avatarContainer", className)}>
      <AvatarHelper colors={colors}></AvatarHelper>
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

  if (preProps.className != newProps.className) {
    return false;
  }

  return true;
};

export default React.memo(forwardRef(Avatar), areEqual);

Avatar.propTypes = {
  avatar: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
  className: PropTypes.string,
};
