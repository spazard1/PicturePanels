/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const D6 = (props) => (
  <svg viewBox="-5 -5 38 38" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>{"dice"}</title>
    <defs>
      <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="d6">
        <stop stopColor={props.colors[0]} offset="0%" />
        <stop stopColor={props.colors[0]} offset="100%" />
      </linearGradient>
    </defs>
    <g fillRule="nonzero" fill="none">
      <path d="M24.5 0A3.5 3.5 0 0 1 28 3.5v21a3.5 3.5 0 0 1-3.5 3.5h-21A3.5 3.5 0 0 1 0 24.5v-21A3.5 3.5 0 0 1 3.5 0h21Z" fill="url(#d6)" />
      <circle fill={props.colors[1] ?? "#1C1C1F"} cx={9.625} cy={7.875} r={1.75} />
      <circle fill={props.colors[1] ?? "#1C1C1F"} cx={9.625} cy={14} r={1.75} />
      <circle fill={props.colors[1] ?? "#1C1C1F"} cx={9.625} cy={20.125} r={1.75} />
      <circle fill={props.colors[1] ?? "#1C1C1F"} cx={18.375} cy={7.875} r={1.75} />
      <circle fill={props.colors[1] ?? "#1C1C1F"} cx={18.375} cy={14} r={1.75} />
      <circle fill={props.colors[1] ?? "#1C1C1F"} cx={18.375} cy={20.125} r={1.75} />
    </g>
  </svg>
);

D6.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const Memo = memo(D6);
export default Memo;
