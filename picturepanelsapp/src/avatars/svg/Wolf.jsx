/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Wolf = (props) => (
  <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <style>{".wolf-2{fill:#2d2d2d}.wolf-3{fill:#aeadb3}.wolf-4{fill:" + (props.colors[1] ?? "#aeadb3") + "}"}</style>
    </defs>
    <title />
    <g>
      <path
        d="m53 56-21 5-21-5 2.27-22.09a18.81 18.81 0 0 1 15.33-16.6 18.8 18.8 0 0 1 6.8 0 18.81 18.81 0 0 1 15.33 16.6Z"
        style={{
          fill: props.colors[0],
        }}
      />
      <circle className="wolf-2" cx={24.5} cy={33.5} r={1.5} />
      <circle className="wolf-2" cx={39.5} cy={33.5} r={1.5} />
      <path
        className="wolf-4"
        d="M28.6 17.31a18.83 18.83 0 0 0-13.53 10.27c-.05-1-.07-2-.07-3.08C15 12.63 18.13 3 22 3c3.05 0 5.64 6 6.6 14.31ZM49 24.5c0 1 0 2.07-.07 3.08A18.81 18.81 0 0 0 35.4 17.31C36.36 9 39 3 42 3c3.87 0 7 9.63 7 21.5ZM28 56a4.81 4.81 0 0 1-4-2.28l-2.81-4.49A2.62 2.62 0 0 0 19 48a1 1 0 0 1 0-2 4.58 4.58 0 0 1 3.91 2.17l2.81 4.49A2.82 2.82 0 0 0 28 54a1 1 0 0 1 0 2ZM32 56a1 1 0 0 1-1-1v-4a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1ZM36 56a1 1 0 0 1 0-2 2.82 2.82 0 0 0 2.31-1.33l2.81-4.49A4.58 4.58 0 0 1 45 46a1 1 0 0 1 0 2 2.62 2.62 0 0 0-2.21 1.23L40 53.72A4.81 4.81 0 0 1 36 56Z"
      />
      <path
        className="wolf-3"
        d="M28.14 56H28a1 1 0 1 1 .14-2h.2a1 1 0 0 1 .83 1 1 1 0 0 1-1.03 1ZM36 56h-.14a1 1 0 0 1 0-2 .93.93 0 0 1 .8.21A1 1 0 0 1 37 55a1 1 0 0 1-1 1Z"
      />
      <path className="wolf-4" d="M36 56h-8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Z" />
      <path
        d="M36 48.33c0 .64-.64 1.23-1.45 1.65a6 6 0 0 1-2.55.69c-1.47 0-4-1.05-4-2.34a2.13 2.13 0 0 1 .79-1.64 2.8 2.8 0 0 1 1.88-.69h2.66A2.52 2.52 0 0 1 36 48.33Z"
        style={{
          fill: "#3e2c27",
        }}
      />
    </g>
  </svg>
);

Wolf.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Wolf);
export default Memo;
