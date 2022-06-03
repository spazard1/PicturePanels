/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const defaultColor2 = "#bd7f00";

const Eagle = (props) => (
  <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <style>{".eagle-3{fill:#2d2d2d}"}</style>
    </defs>
    <title />
    <g id="bird">
      <path
        d="m56.92 48.75-1.57-5.1A53.24 53.24 0 0 1 53 28c0-.72 0-1.44-.11-2.15a20.7 20.7 0 0 0-1-4.61A21.37 21.37 0 0 0 50.47 18a21 21 0 0 0-6.73-7.4c-.56-.38-1.13-.73-1.73-1.06a21.08 21.08 0 0 0-20 0c-.6.33-1.17.68-1.73 1.06a20.66 20.66 0 0 0-3.11 2.56 20.93 20.93 0 0 0-4.5 6.68 20.51 20.51 0 0 0-1.54 6C11 26.56 11 27.28 11 28a53.24 53.24 0 0 1-2.35 15.65l-1.57 5.1a1.81 1.81 0 0 0-.08.51A1.74 1.74 0 0 0 8.74 51H11a6 6 0 0 0 5.65-4 5.8 5.8 0 0 0 .35-2v6a3 3 0 0 0 2.92 3A7 7 0 0 0 27 47v4.78A5.16 5.16 0 0 0 31.51 57 5 5 0 0 0 37 52v-5a7 7 0 0 0 7.08 7A3 3 0 0 0 47 51v-6a5.8 5.8 0 0 0 .35 2A6 6 0 0 0 53 51h2.26A1.74 1.74 0 0 0 57 49.26a1.81 1.81 0 0 0-.08-.51Z"
        style={{
          fill: props.colors[0],
        }}
      />
      <path
        d="M35 27.46h1.95a1 1 0 0 1 1 1v11H27a1 1 0 0 1-1-1v-2a9 9 0 0 1 9-9Z"
        transform="rotate(45 31.983 33.478)"
        style={{
          fill: props.colors[1] ?? defaultColor2,
        }}
      />
      <circle className="eagle-3" cx={43.5} cy={24.5} r={1.5} />
      <circle className="eagle-3" cx={20.5} cy={24.5} r={1.5} />
    </g>
  </svg>
);

Eagle.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Eagle);
export default Memo;
