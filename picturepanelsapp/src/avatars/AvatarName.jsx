import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Avatar from "./Avatar";

import "./AvatarName.css";

const AvatarName = ({ avatar, colors, name, className }) => {
  return (
    <div className={classNames("avatarNameContainer", className)}>
      <Avatar avatar={avatar} colors={colors} className={className}></Avatar>
      <div className="nameContainer">{name}</div>
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

  if (preProps.name != newProps.name) {
    return false;
  }

  if (preProps.className != newProps.className) {
    return false;
  }

  return true;
};

AvatarName.propTypes = {
  avatar: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string,
  className: PropTypes.string,
};

export default React.memo(AvatarName, areEqual);
