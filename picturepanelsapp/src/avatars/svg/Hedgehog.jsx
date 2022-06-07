/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Hedgehog = (props) => (
  <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="none" fillRule="evenodd">
      <path
        fill={props.colors[0]}
        d="m41 49.636-5.265 3.725-2.931-5.746-6.393.852.075-6.449-6.056-2.217 3.063-5.675-4.333-4.778 5.351-3.602-1.617-6.243 6.411-.703 1.471-6.28 6.004 2.357L41 10l4.22 4.877 6.004-2.357 1.471 6.28 6.411.703-1.617 6.243 5.351 3.602-4.333 4.778 3.063 5.675-6.056 2.217.075 6.449-6.393-.852-2.931 5.746z"
      />
      <path fill={props.colors[1] ?? "#FFAF40"} d="M22 46a8 8 0 1 0 0-16c-4.418 0-15.707 8-15.707 8S17.582 46 22 46Z" />
      <circle cx={21} cy={34} r={2} fill="#595959" />
      <circle cx={27} cy={31} r={4} fill={props.colors[1] ?? "#FFAF40"} />
      <circle cx={6} cy={38} r={2} fill="#595959" />
    </g>
  </svg>
);

Hedgehog.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Hedgehog);
export default Memo;
