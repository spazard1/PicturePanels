/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Gorilla = (props) => (
  <svg viewBox="-3 -3 42 42" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill={props.colors[0]} d="M5 16c0-4-5-3-4 1s3 5 3 5l1-6zm26 0c0-4 5-3 4 1s-3 5-3 5l-1-6z" />
    <path
      fill={props.colors[0]}
      d="M32.65 21.736c0 10.892-4.691 14.087-14.65 14.087-9.958 0-14.651-3.195-14.651-14.087S8.042.323 18 .323c9.959 0 14.65 10.521 14.65 21.413z"
    />
    <path
      fill={props.colors[1] ? props.colors[1] : "#66757F"}
      d="M27.567 23c1.49-4.458 2.088-7.312-.443-7.312H8.876c-2.532 0-1.933 2.854-.444 7.312C3.504 34.201 17.166 34.823 18 34.823S32.303 33.764 27.567 23z"
    />
    <path fill="#31373D" d="M15 18.003a2 2 0 0 1-4 0c0-1.104.896-1 2-1s2-.105 2 1zm10 0a2 2 0 0 1-4 0c0-1.104.896-1 2-1s2-.105 2 1z" />
    <ellipse fill="#31373D" cx={15.572} cy={23.655} rx={1.428} ry={1} />
    <path fill="#31373D" d="M21.856 23.655c0 .553-.639 1-1.428 1-.79 0-1.429-.447-1.429-1 0-.553.639-1 1.429-1s1.428.448 1.428 1z" />
    <path
      fill="#99AAB5"
      d="M21.02 21.04c-1.965-.26-3.02.834-3.02.834s-1.055-1.094-3.021-.834c-3.156.417-3.285 3.287-1.939 3.105.766-.104.135-.938 1.713-1.556 1.579-.616 3.247.66 3.247.66s1.667-1.276 3.246-.659.947 1.452 1.714 1.556c1.346.181 1.218-2.689-1.94-3.106z"
    />
    <path
      fill="#31373D"
      d="M24.835 30.021c-1.209.323-3.204.596-6.835.596s-5.625-.272-6.835-.596c-3.205-.854-1.923-1.735 0-1.477 1.923.259 3.631.415 6.835.415 3.205 0 4.914-.156 6.835-.415 1.923-.258 3.204.623 0 1.477z"
    />
    <path
      fill={props.colors[0]}
      d="M4.253 16.625c1.403-1.225-1.078-3.766-2.196-2.544-.341.373.921-.188 1.336 1.086.308.942.001 2.208.86 1.458zm27.493 0c-1.402-1.225 1.078-3.766 2.196-2.544.341.373-.921-.188-1.337 1.086-.306.942 0 2.208-.859 1.458z"
    />
  </svg>
);

Gorilla.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Gorilla);
export default Memo;
