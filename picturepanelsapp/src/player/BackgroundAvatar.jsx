import React from "react";
import PropTypes from "prop-types";
import Avatar from "../avatars/Avatar";

import "./BackgroundAvatar.css";

const BackgroundAvatar = ({ avatar, colors }) => {
  return <Avatar avatar={avatar} colors={colors} className="backgroundAvatar" />;
};

export default BackgroundAvatar;

BackgroundAvatar.propTypes = {
  avatar: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};
