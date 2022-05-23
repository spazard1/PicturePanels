/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./SvgDots.css";

const defaultColor2 = "#646467";

const Hippo = (props) => (
  <svg viewBox="0 0 64 64" className="playerDotSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <style>{".hippo-2{fill:" + (props.colors[1] ?? defaultColor2) + "}.hippo-3{fill:#2d2d2d}.hippo-4{fill:#d8d9dd}.hippo-5{fill:#434347}"}</style>
    </defs>
    <title />
    <g id="hippopotamus">
      <path
        d="M57 41c0 7.39-5.74 11.62-13 12h-1a13.83 13.83 0 0 1-5-.92h-.07a16.19 16.19 0 0 0-11.86 0H26a13.83 13.83 0 0 1-5 .92h-1c-7.26-.35-13-4.58-13-12 0-5.18 2.81-7.7 7-10.12V24.5a17.49 17.49 0 0 1 29-13.17c.3.26.58.52.86.8a17.64 17.64 0 0 1 2.89 3.81A17.34 17.34 0 0 1 49 24.5v5.85c4.73 2.25 8 5.07 8 10.65Z"
        style={{
          fill: props.colors[0],
        }}
      />
      <path className="hippo-2" d="M20.91 10.58a17.34 17.34 0 0 0-4.7 5.42 4.5 4.5 0 1 1 4.7-5.41Z" />
      <circle className="hippo-3" cx={23.5} cy={20.5} r={1.5} />
      <circle className="hippo-3" cx={40.5} cy={20.5} r={1.5} />
      <path className="hippo-2" d="M52 11.5a4.51 4.51 0 0 1-5.24 4.44 17.64 17.64 0 0 0-2.89-3.81c-.28-.28-.56-.54-.86-.8a4.5 4.5 0 0 1 9 .17Z" />
      <path
        className="hippo-4"
        d="M26 52.08V56a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3h1a13.83 13.83 0 0 0 5-.92ZM44 53v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3.92a13.83 13.83 0 0 0 5 .92h1Z"
      />
      <circle className="hippo-5" cx={18.5} cy={41.5} r={2.5} />
      <circle className="hippo-5" cx={45.5} cy={41.5} r={2.5} />
    </g>
  </svg>
);

Hippo.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const Memo = memo(Hippo);
export default Memo;
