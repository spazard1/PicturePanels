import React from "react";
import PropTypes from "prop-types";
import Avatar from "../avatars/Avatar";

import "./BackgroundAvatar.css";

const BackgroundAvatar = ({ name, teamName, avatar, colors }) => {
  return (
    <div className="backgroundAvatarContainer">
      <Avatar avatar={avatar} colors={colors} className="backgroundAvatar" />
      <div className="backgroundAvatarName">{name}</div>
      <div className="backgroundAvatarName">{teamName}</div>
    </div>
  );
};

export default BackgroundAvatar;

BackgroundAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};
