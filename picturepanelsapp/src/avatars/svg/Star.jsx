/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Star = (props) => (
  <svg viewBox="-3 -3 30 30" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="m12-.012 4 9 8 1-6 5 2 9-8-5-8 5 2-9-6-5 8-1z" fill={props.colors[0]} />
    <g fill={props.colors[1] ? props.colors[1] : props.colors[0]?.darken(0.25)}>
      <path d="M12 0v13l4-4zM12 13l12-3-6 5zM12 13l8 11-8-5zM12 13 4 24l2-9zM12 13 0 10l8-1z" />
    </g>
  </svg>
);

Star.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Star);
export default Memo;
