/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Flask = (props) => (
  <svg viewBox="-2 -2 40 40" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill={props.colors[1] ?? "#67757F"} d="M16 34.375a1 1 0 1 1-2 0V26a1 1 0 1 1 2 0v8.375z" />
    <circle fill="#E1E8ED" cx={15.41} cy={15.625} r={13.873} />
    <path fill={props.colors[0]} d="M3.592 16.139c.232 6.334 5.427 11.402 11.818 11.402s11.586-5.068 11.818-11.402H3.592z" />
    <path fill={props.colors[1] ?? "#67757F"} d="M30 24a2 2 0 0 1-2 2H3a2 2 0 0 1 0-4h25a2 2 0 0 1 2 2z" />
    <path
      fill={props.colors[1] ?? "#67757F"}
      d="M2.622 35.207a.999.999 0 1 1-1.883-.673l3.317-9.262a1 1 0 1 1 1.883.673l-3.317 9.262zm25.757 0a1 1 0 0 0 1.882-.673l-3.359-9.345a1 1 0 1 0-1.882.672l3.359 9.346z"
    />
    <path
      fill="#E1E8ED"
      d="M19.006 2.266S32.36 6.948 33.778 7.404c3.725 1.199 2.184 5.224-.385 4.582-5.083-1.271-14.387-4.068-15.415-4.068s1.028-5.652 1.028-5.652z"
    />
    <path fill={props.colors[1] ? props.colors[1].lighten(0.25) : "#67757F"} d="M29 23a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h25a1 1 0 0 1 1 1z" />
    <ellipse fill={props.colors[0]?.lighten(0.2)} cx={15.41} cy={16.139} rx={11.818} ry={1.629} />
    <ellipse transform="rotate(-74.365 34.047 9.981)" fill="#AAB8C2" cx={34.047} cy={9.982} rx={1.341} ry={0.974} />
  </svg>
);

Flask.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Flask);
export default Memo;
