/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Bulb = (props) => (
  <svg viewBox="-4 -4 136 136" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <style>{".bulb-2{fill:#404040}.bulb-4{fill:#f5f5f5}"}</style>
    </defs>
    <title />
    <path
      d="M82 93V81.82a20.38 20.38 0 0 1 6.65-15.23 37 37 0 1 0-49.39-.09A20.59 20.59 0 0 1 46 81.82v10.77"
      style={{
        fill: props.colors[0],
      }}
    />
    <path
      className="bulb-2"
      d="M82 95a2 2 0 0 1-2-2V81.82a22.38 22.38 0 0 1 7.31-16.72 35 35 0 1 0-46.72-.1A22.61 22.61 0 0 1 48 81.82v10.76a2 2 0 0 1-4 0V81.82A18.6 18.6 0 0 0 37.92 68a39 39 0 1 1 52.08.08 18.38 18.38 0 0 0-6 13.74V93a2 2 0 0 1-2 2Z"
    />
    <path
      d="M82 92v16a18.05 18.05 0 0 1-18 18 18.05 18.05 0 0 1-18-18V92Z"
      style={{
        fill: props.colors[1] ?? "#9e9e9e",
      }}
    />
    <path className="bulb-2" d="M64 128a20 20 0 0 1-20-20V92a2 2 0 0 1 2-2h36a2 2 0 0 1 2 2v16a20 20 0 0 1-20 20ZM48 94v14a16 16 0 0 0 32 0V94Z" />
    <path className="bulb-4" d="m54 102 28-4" />
    <path className="bulb-2" d="M54 104a2 2 0 0 1-.28-4l28-4a2 2 0 0 1 .57 4l-28 4Z" />
    <path className="bulb-4" d="m54 110 28-4" />
    <path className="bulb-2" d="M54 112a2 2 0 0 1-.28-4l28-4a2 2 0 0 1 .57 4l-28 4Z" />
  </svg>
);

Bulb.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Bulb);
export default Memo;
