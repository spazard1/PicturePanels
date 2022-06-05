/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Magnet = (props) => (
  <svg viewBox="5 5 62 62" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill={props.colors[0]} d="M43.5 36.5V47a8.5 8.5 0 0 1-17 0V36.5h-6V47a14.5 14.5 0 0 0 29 0V36.5Z" />
    <g fill="#d0cfce">
      <path d="M20.5 31.5h6v5h-6zM43.5 31.5h6v5h-6z" />
    </g>
    <path
      fill={props.colors[1] ? props.colors[1] : props.colors[0]?.rotate(180)}
      d="M44.882 19.775a1.283 1.283 0 0 0-1.26-.907h-4.925l3.461-7.75a1 1 0 0 0-1.645-1.089L29.42 21.958a1.327 1.327 0 0 0-.278 1.451 1.37 1.37 0 0 0 1.266.85h4.88l-4.996 8.05a1 1 0 0 0 .213 1.299c.227.188.38.315.572.315.4 0 .966-.557 2.716-2.279L44.21 21.371a1.452 1.452 0 0 0 .672-1.596Z"
    />
    <g fill="none" stroke="#000" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M43.5 36.5V47a8.5 8.5 0 0 1-17 0V36.5h-6V47a14.5 14.5 0 0 0 29 0V36.5Z" />
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.5 31.5h6v5h-6zM43.5 31.5h6v5h-6z" />
      </g>
      <path
        strokeMiterlimit={10}
        d="M44.882 19.775a1.283 1.283 0 0 0-1.26-.907h-4.925l3.461-7.75a1 1 0 0 0-1.645-1.089L29.42 21.958a1.327 1.327 0 0 0-.278 1.451 1.37 1.37 0 0 0 1.266.85h4.88l-4.996 8.05a1 1 0 0 0 .213 1.299c.227.188.38.315.572.315.4 0 .966-.557 2.716-2.279L44.21 21.371a1.452 1.452 0 0 0 .672-1.596Z"
      />
    </g>
  </svg>
);

Magnet.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Magnet);
export default Memo;
