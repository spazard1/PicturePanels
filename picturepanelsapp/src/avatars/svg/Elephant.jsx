/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Elephant = (props) => (
  <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <style>
        {".elephant-1{fill:#2d2d2d}.elephant-3{fill:" + props.colors[0]?.darken(0.2) + "}.elephant-4{fill:" + (props.colors[1] ?? "#d8d9dd") + "}"}
      </style>
    </defs>
    <title />
    <circle className="elephant-1" cx={27.5} cy={38.5} r={1.5} id="goat" />
    <g id="elepant">
      <path
        d="M49 22v7a20 20 0 0 1-.73 5.35l-.15.53-2.69 8.72a2 2 0 0 1-1.91 1.4H43v-1.5a2.5 2.5 0 0 0-5 0V47a12 12 0 0 1-12 12h-3a6 6 0 0 1-6-6h3a3 3 0 0 0 6 0v-9.5a2.5 2.5 0 1 0-5 0V45h-.52a2 2 0 0 1-1.91-1.41l-2.69-8.72-.15-.53A20 20 0 0 1 15 29v-7a17 17 0 0 1 34 0Z"
        style={{
          fill: props.colors[0],
        }}
      />
      <circle className="elephant-1" cx={42.5} cy={29.38} r={1.5} />
      <circle className="elephant-1" cx={21.5} cy={29.38} r={1.5} />
      <path
        className="elephant-3"
        d="M61 13v7a6.13 6.13 0 0 1-.23 1.64l-2.53 9A6 6 0 0 1 52.46 35H51a6 6 0 0 1-2.73-.66A20 20 0 0 0 49 29v-7a16.91 16.91 0 0 0-3.76-10.66A6 6 0 0 1 51 7h4a6 6 0 0 1 6 6ZM15 29a20 20 0 0 0 .73 5.35A6 6 0 0 1 13 35h-1.46a6 6 0 0 1-5.78-4.37l-2.53-8.95A6.13 6.13 0 0 1 3 20v-7a6 6 0 0 1 6-6h4a6 6 0 0 1 5.76 4.34A16.91 16.91 0 0 0 15 22Z"
      />
      <path className="elephant-4" d="M43 43.5V51a5 5 0 0 1-5-5v-2.5a2.5 2.5 0 1 1 5 0ZM26 43.5V46a5 5 0 0 1-5 5v-7.5a2.5 2.5 0 0 1 5 0Z" />
    </g>
  </svg>
);

Elephant.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Elephant);
export default Memo;
