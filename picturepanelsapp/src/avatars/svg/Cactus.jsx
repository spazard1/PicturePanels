/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Cactus = (props) => {
  let color2;
  if (props.colors.length === 1) {
    color2 = props.colors[0].rotate(180);
  } else {
    color2 = props.colors[1];
  }

  return (
    <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <style>
          {".cactus-1,.cactus-4{fill:" +
            props.colors[0] +
            ";stroke:#004924;stroke-miterlimit:10;stroke-width:2px}.cactus-4{fill:none;stroke-linecap:round}.cactus-5{fill:" +
            color2 +
            "}"}
        </style>
      </defs>
      <title />
      <g data-name="Layer 25">
        <path
          className="cactus-1"
          d="m40.53 28.5-6.45-2.72.61-10.08c.34-5.58 5.38-11 11.05-8.61 5.67 2.39 5.32 9.78 1.57 13.92ZM22.62 33.5l6.45-2.72-.61-10.08c-.34-5.58-5.38-11-11.05-8.61-5.67 2.39-5.32 9.78-1.57 13.92Z"
        />
        <path
          style={{
            stroke: "#42210b",
            fill: "#8c6239",
            strokeMiterlimit: 10,
            strokeWidth: 2,
          }}
          d="M45.93 58.08H21.32l-3.56-9.56h31.73l-3.56 9.56z"
        />
        <path className="cactus-1" d="M33.63 18.83a12.75 12.75 0 0 1 12.75 12.75v11.75h-25.5V31.58a12.75 12.75 0 0 1 12.75-12.75Z" />
        <rect
          height={5.38}
          rx={1.9}
          ry={1.9}
          width={38.25}
          x={14.5}
          y={43.21}
          style={{
            fill: "#c69c6d",
            stroke: "#42210b",
            strokeMiterlimit: 10,
            strokeWidth: 2,
          }}
        />
        <path
          className="cactus-4"
          d="m18.33 13.54-.16-5.58M47.86 18.46l5.79-1.92M15.65 21.9l-5.3-1.72M21.71 39.07l-4.91-2.64M45.61 31.8l2.91-5.22M44.85 39.19l4.43-4.01"
        />
        <circle className="cactus-5" cx={43.38} cy={11.13} r={1.75} />
        <circle className="cactus-5" cx={38.38} cy={30.13} r={1.75} />
        <circle className="cactus-5" cx={28.38} cy={30.13} r={1.75} />
        <circle className="cactus-5" cx={39.38} cy={38.13} r={1.75} />
        <circle className="cactus-5" cx={28.38} cy={39.13} r={1.75} />
        <circle className="cactus-5" cx={34.38} cy={25.13} r={1.75} />
        <path className="cactus-4" d="m25.84 16.22 4.09-3.71" />
        <circle className="cactus-5" cx={19.38} cy={22.13} r={1.75} />
        <circle className="cactus-5" cx={22.38} cy={17.13} r={1.75} />
        <path className="cactus-4" d="M38.71 10.07 33.8 7.43M48.19 12.15l5.13-3.3" />
        <circle className="cactus-5" cx={44.38} cy={16.13} r={1.75} />
      </g>
    </svg>
  );
};

Cactus.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Cactus);
export default Memo;
