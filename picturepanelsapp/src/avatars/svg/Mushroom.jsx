/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Mushroom = (props) => (
  <svg viewBox="-4 -4 44 44" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill="#99AAB5" d="M27 33c0 2.209-1.791 3-4 3H13c-2.209 0-4-.791-4-3s3-7 3-13 12-6 12 0 3 10.791 3 13z" />
    <path
      fill={props.colors[0]}
      d="m34.666 11.189-.001-.002a17.932 17.932 0 0 0-4.208-6.182h-.003A17.92 17.92 0 0 0 18 0 17.962 17.962 0 0 0 0 18a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4c0-2.417-.48-4.713-1.334-6.811z"
    />
    <g fill={props.colors[1] ? props.colors[1] : props.colors[0]?.rotate(30)}>
      <path d="M7.708 16.583A6.292 6.292 0 1 0 7.708 4c-.405 0-.8.042-1.184.115A17.962 17.962 0 0 0 1.448 10.9a6.29 6.29 0 0 0 6.26 5.683z" />
      <path d="M7.708 4.25c3.331 0 6.041 2.71 6.041 6.042s-2.71 6.042-6.041 6.042a6.014 6.014 0 0 1-6.006-5.394 17.773 17.773 0 0 1 4.931-6.59c.364-.067.726-.1 1.075-.1m0-.25c-.405 0-.8.042-1.184.115A17.962 17.962 0 0 0 1.448 10.9 6.291 6.291 0 1 0 7.708 4zM26 9.5a4.497 4.497 0 0 0 8.666 1.689l-.001-.002a17.932 17.932 0 0 0-4.208-6.182A4.496 4.496 0 0 0 26 9.5z" />
      <circle cx={21.5} cy={16} r={4.5} />
      <circle cx={20} cy={5} r={3} />
    </g>
  </svg>
);

Mushroom.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Mushroom);
export default Memo;
