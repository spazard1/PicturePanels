/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./SvgDots.css";

const defaultColor2 = "#454749";

const Alien = (props) => (
  <svg viewBox="-2 -2 68 68" className="playerDotSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M59.5 30.6C59.5 54.1 32 62 32 62S4.5 54.1 4.5 30.6C4.5 13.1 15.5 2 32 2s27.5 11.1 27.5 28.6z" fill={props.colors[0]} />
    <g fill={props.colors[1] ?? defaultColor2}>
      <path d="M23.4 26.4c4 3.8 5.1 8.9 2.6 11.4-2.5 2.4-7.8 1.3-11.7-2.5-4-3.8-5.1-8.9-2.6-11.4 2.5-2.5 7.7-1.4 11.7 2.5" />
      <path d="M26.4 30.6c-2.6-2.3-5.2-4.1-8-5.7-1.4-.8-2.9-1.5-4.4-2.1-1.5-.6-3.1-1.2-4.7-1.8 1.7-.2 3.5-.1 5.2.3 1.7.4 3.4 1 4.9 1.8 1.5.8 2.9 1.9 4.2 3.2 1.1 1.2 2.2 2.6 2.8 4.3" />
    </g>
    <path d="M20.4 25c2 1.2 3.1 3.1 2.5 4.1-.7 1-2.9.8-4.9-.4-2-1.2-3.1-3.1-2.5-4.1.7-1 2.8-.8 4.9.4" fill="#fff" />
    <g fill={props.colors[1] ?? defaultColor2}>
      <path d="M40.6 26.4c-4 3.8-5.1 8.9-2.6 11.4 2.5 2.4 7.8 1.3 11.7-2.5 4-3.8 5.1-8.9 2.6-11.4-2.5-2.5-7.7-1.4-11.7 2.5" />
      <path d="M37.6 30.6c.6-1.6 1.7-3 2.9-4.3 1.2-1.2 2.6-2.3 4.2-3.2 1.5-.9 3.2-1.5 4.9-1.8 1.7-.4 3.4-.5 5.2-.3-1.6.6-3.2 1.1-4.7 1.8-1.5.6-3 1.3-4.4 2.1-2.9 1.5-5.5 3.4-8.1 5.7" />
    </g>
    <path d="M43.6 25c-2 1.2-3.1 3.1-2.5 4.1.7 1 2.9.8 4.9-.4 2-1.2 3.1-3.1 2.5-4.1-.7-1-2.8-.8-4.9.4" fill="#fff" />
    <path
      d="M32 48.6c-7.6 0-10.7-3.7-10.7-2.4 0 1.9 4.8 4.4 10.7 4.4s10.7-2.5 10.7-4.4c0-1.3-3.1 2.4-10.7 2.4z"
      fill="#454749"
      stroke="#454749"
      strokeMiterlimit={10}
    />
  </svg>
);

Alien.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const Memo = memo(Alien);
export default Memo;
