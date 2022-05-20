/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./SvgDots.css";

const Bunny = (props) => (
  <svg className="playerDotSvg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <style>{".cls-1{fill:" + props.color + "}.cls-3{fill:#d37b93}.cls-5{fill:#2d2d2d}"}</style>
    </defs>
    <title />
    <g id="rabbit">
      <path className="cls-1" d="M30 13v13.1a21 21 0 0 0-16 10.08V13a8 8 0 1 1 16 0Z" />
      <path
        d="M50 13v23.18A21 21 0 0 0 34 26.1V13a8 8 0 1 1 16 0Z"
        style={{
          fill: "#aeaeaf",
        }}
      />
      <path className="cls-1" d="M50 13v23.18A21 21 0 0 0 34 26.1V13a8 8 0 1 1 16 0Z" />
      <path className="cls-3" d="M25 13v14.21a20.41 20.41 0 0 0-6 3.3V13a3 3 0 0 1 6 0Z" />
      <path
        d="M53 47a12 12 0 0 1-12 12H23a12 12 0 0 1-12-12 20.94 20.94 0 0 1 8-16.49 20.41 20.41 0 0 1 6-3.3 20.75 20.75 0 0 1 5-1.11 20 20 0 0 1 4 0 20.75 20.75 0 0 1 5 1.11 20.41 20.41 0 0 1 6 3.3A21 21 0 0 1 53 47Z"
        style={{
          fill: props.color,
        }}
      />
      <path className="cls-1" d="M28.5 57a4.51 4.51 0 0 1-4.5-4.5 1 1 0 0 1 2 0 2.5 2.5 0 0 0 5 0 1 1 0 0 1 2 0 4.51 4.51 0 0 1-4.5 4.5Z" />
      <path className="cls-1" d="M35.5 57a4.51 4.51 0 0 1-4.5-4.5 1 1 0 0 1 2 0 2.5 2.5 0 0 0 5 0 1 1 0 0 1 2 0 4.51 4.51 0 0 1-4.5 4.5Z" />
      <path className="cls-3" d="M45 13v17.51a20.41 20.41 0 0 0-6-3.3V13a3 3 0 0 1 6 0Z" />
      <path className="cls-1" d="M31 50h2v3h-2z" />
      <path
        className="cls-3"
        d="m32 52-2.23-1.19a1.49 1.49 0 0 1-.77-1.33A1.43 1.43 0 0 1 30.39 48h3.22A1.43 1.43 0 0 1 35 49.48a1.49 1.49 0 0 1-.77 1.33Z"
      />
      <circle className="cls-5" cx={40.5} cy={42.5} r={1.5} />
      <circle className="cls-5" cx={23.5} cy={42.5} r={1.5} />
    </g>
  </svg>
);

Bunny.propTypes = {
  color: PropTypes.string,
};

const Memo = memo(Bunny);
export default Memo;
