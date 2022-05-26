/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const defaultColor2 = "#00c853";

const ChiliPepper = (props) => (
  <svg viewBox="0 0 32 32" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title />
    <g data-name="Layer 3">
      <path
        d="M22.25 10.82a3.52 3.52 0 0 1-1.56 1 .5.5 0 0 1-.47-.13 2.56 2.56 0 0 1-.7-1.48 3.66 3.66 0 0 0-2.37.72.49.49 0 0 1-.41 0 16.56 16.56 0 0 0-1.63 4.89C14 21.78 13.42 24.49 6.67 27a.48.48 0 0 0-.32.43.49.49 0 0 0 .25.47 8.94 8.94 0 0 0 4.47 1.19c3.92 0 7.9-2.55 10.46-7.08a22 22 0 0 0 3.1-9.44 6.19 6.19 0 0 0-2.38-1.75Z"
        style={{
          fill: props.colors[0],
        }}
      />
      <path
        d="M23.22 8.54a4.48 4.48 0 0 1-.39.61l-.08.09-.14.09a1.09 1.09 0 0 1-.62.21.87.87 0 0 1-.25 0 1 1 0 0 1-.68-.7.51.51 0 0 1 .07-.43.91.91 0 0 0 .13-.41c-1-.28-3.22-.55-4.81 2.21a.49.49 0 0 0 .09.61.42.42 0 0 0 .2.1.49.49 0 0 0 .41 0 3.66 3.66 0 0 1 2.37-.72 2.56 2.56 0 0 0 .7 1.48.5.5 0 0 0 .47.13 3.52 3.52 0 0 0 1.56-1 6.19 6.19 0 0 1 2.38 1.79.91.91 0 0 1 .13.16.53.53 0 0 0 .39.18.41.41 0 0 0 .16 0 .49.49 0 0 0 .34-.46 3.77 3.77 0 0 0-2.43-3.94Z"
        style={{
          fill: props.colors[1] ?? defaultColor2,
        }}
      />
      <path
        d="M24.06 3.49a.51.51 0 0 0-.55-.41l-2.1.27a.51.51 0 0 0-.35.22A.49.49 0 0 0 21 4a10.55 10.55 0 0 1 .26 4 .91.91 0 0 1-.14.33.51.51 0 0 0-.07.43 1 1 0 0 0 .68.7.87.87 0 0 0 .25 0 1.09 1.09 0 0 0 .62-.21l.14-.09.08-.09a4.48 4.48 0 0 0 .39-.61 8.11 8.11 0 0 0 .85-4.97Z"
        style={{
          fill: "#795548",
        }}
      />
    </g>
  </svg>
);

ChiliPepper.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const Memo = memo(ChiliPepper);
export default Memo;
