/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Camera = (props) => (
  <svg viewBox="0 0 500 500" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <style>{".camera{fill:" + (props.colors[1] ? props.colors[1] : props.colors[0]?.lighten(0.4)) + "}"}</style>
    <g id="camera">
      <path
        d="M428.53 131.52H307.46l-21.23-27.51h-72.46l-21.23 27.51H71.47c-13.43 0-24.31 10.89-24.31 24.31v217.21c0 13.43 10.89 24.31 24.31 24.31h357.06c13.43 0 24.31-10.89 24.31-24.31V155.83c0-13.42-10.88-24.31-24.31-24.31z"
        style={{
          fill: props.colors[0],
        }}
      />
      <path className="camera" d="M156.75 131.52H97.27v-20.55c0-4.6 3.73-8.33 8.33-8.33h42.83c4.6 0 8.33 3.73 8.33 8.33v20.55z" />
      <circle className="camera" cx={391.29} cy={172.09} r={18.13} />
      <path
        className="camera"
        d="M250 184.21c-47.55 0-86.09 38.54-86.09 86.09s38.54 86.09 86.09 86.09c47.55 0 86.09-38.54 86.09-86.09s-38.54-86.09-86.09-86.09zm0 146.54c-33.39 0-60.45-27.06-60.45-60.45s27.06-60.45 60.45-60.45 60.45 27.06 60.45 60.45c0 33.38-27.06 60.45-60.45 60.45z"
      />
    </g>
  </svg>
);

Camera.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Camera);
export default Memo;
