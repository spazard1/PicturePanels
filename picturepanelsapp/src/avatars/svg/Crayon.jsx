/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Crayon = (props) => (
  <svg className="playerAvatarSvg" viewBox="-4 -4 44 44" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.colors[0]}
      d="M35.702 7.477 28.522.298a1.015 1.015 0 0 0-1.436 0L3.395 23.989a1.016 1.016 0 0 0 0 1.437c.72.719-3.14 7.959-3.395 8.496L2.068 36c.536-.255 7.785-4.115 8.506-3.395a1.015 1.015 0 0 0 1.436 0L35.702 8.913a1.015 1.015 0 0 0 0-1.436z"
    />
    <path fill={props.colors[0]?.lighten(0.15)} d="M4.139 23.24 26.407.972l8.62 8.62L12.759 31.86z" />
    <path fill={props.colors[1] ?? "#292F33"} d="m23.534 3.846 1.437-1.436 8.62 8.62-1.437 1.436zM5.576 21.803l1.436-1.437 8.62 8.62-1.437 1.437z" />
    <path
      fill={props.colors[0]?.darken(0.1)}
      d="M26.886 9.353c-1.521-1.521-5.982.476-9.967 4.459-3.983 3.984-5.979 8.446-4.459 9.967 1.52 1.521 5.983-.476 9.967-4.459 3.983-3.984 5.979-8.447 4.459-9.967z"
    />
  </svg>
);

Crayon.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Crayon);
export default Memo;
