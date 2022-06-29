import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Avatar from "./Avatar";

import "./AvatarName.css";

const AvatarName = ({ avatar, colors, name, className, horizontal = false }) => {
  return (
    <div className={classNames("avatarNameContainer", className, { avatarNameHorizontal: horizontal })}>
      <Avatar avatar={avatar} colors={colors}></Avatar>
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
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
  name: PropTypes.string,
  className: PropTypes.string,
  horizontal: PropTypes.bool,
};

export default React.memo(AvatarName, areEqual);
