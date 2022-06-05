/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Hat = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 2048 2048"
    className="playerAvatarSvg"
    style={{
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      imageRendering: "optimizeQuality",
      fillRule: "evenodd",
      clipRule: "evenodd",
    }}
    {...props}
  >
    <path
      d="M1703 1212c70 62 102 120 84 168-24 64-134 85-294 66-318-37-787-210-1053-389-133-90-204-177-180-241 18-49 85-73 184-73 336 24 999 239 1258 469z"
      style={{
        fill: props.colors[0]?.darken(0.1),
        fillRule: "nonzero",
      }}
    />
    <path
      d="M1244 619c43 16 87 22 133 28 43 5 101 11 133 42 5 5 9 10 13 16 4 7 7 15 9 23 4 18 0 35-6 52-7 20-17 40-27 59-19 38-117 236-132 276l-4 12-11-1c-97-8-191-30-281-64-99-37-193-87-281-145l-10-7 84-172c20-42 29-87 41-132 6-23 12-47 21-69 7-17 16-34 32-45 6-4 14-7 21-9 24-6 49 2 70 14 24 13 47 30 69 46 40 29 79 58 126 75z"
      style={{
        fill: props.colors[0],
      }}
    />
    <path
      d="m1359 1136 4-12c1-2 2-5 3-8 6-13 15-35 27-60-119-14-455-120-574-228l-27 54-13 27c126 110 472 217 580 226z"
      style={{
        fill: props.colors[1] ?? "#ffd600",
      }}
    />
    <path
      d="m1026 931 98 38c6 2 10 7 13 12 2 5 3 12 1 18l-9 24-13 34c-2 6-7 10-12 13-5 2-12 3-18 1l-98-38c-6-2-10-7-13-12-2-5-3-12-1-18l12-30 11-28c2-6 7-10 12-13 5-2 12-3 18-1zm91 56-98-38h-3c-1 0-1 1-2 2l-11 28-12 30v2c0 1 1 1 2 2l98 38h3c1 0 1-1 2-2l13-34 9-24v-3c0-1-1-1-2-2z"
      style={{
        fill: "#212121",
        fillRule: "nonzero",
      }}
    />
    <path
      style={{
        fill: "none",
      }}
      d="M0 0h2048v2048H0z"
    />
  </svg>
);

Hat.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Hat);
export default Memo;
