import React from "react";
import PropTypes from "prop-types";
import AllAvatars from "./AllAvatars";

const Avatar = ({ avatar, colors }) => {
  const AvatarHelper = AllAvatars[avatar];

  return <AvatarHelper colors={colors}></AvatarHelper>;
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

  return true;
};

Avatar.propTypes = {
  avatar: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default React.memo(Avatar, areEqual);
