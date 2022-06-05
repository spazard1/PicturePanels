/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Snail = (props) => (
  <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="none" fillRule="evenodd">
      <path stroke="#BD7575" strokeLinecap="round" strokeWidth={2} d="m54.841 37.579-3.582-16.53m2.967 17.952 7.847-19.748" />
      <path fill={props.colors[1] ?? "#FFAF40"} d="m14.628 47.538-7.413 4.716h41.397a7.56 7.56 0 0 0 7.555-7.552v-7.553H45.495L14.628 47.54Z" />
      <path
        fill={props.colors[0]}
        d="M47.581 37.911s-.283-7.958-6.364-16.041c-6.08-8.083-8.475-9.224-11.873-9.224-3.398 0-9.008-1.83-15.869 1.594-6.86 3.423-9.43 7.588-10.867 11.956-1.436 4.368 1.375 13.477 7.626 17.282 1.869 1.137 1.399 6.154 14.552 5.537C37.94 48.398 47.581 37.91 47.581 37.91Z"
      />
      <path
        stroke="#9C4D4D"
        strokeLinecap="round"
        strokeWidth={2}
        d="M46.577 37.31s-2.935-32.28-30.394-23.8c-27.458 8.48-7.64 35.605 4.538 35.605S44.24 33.1 29.75 25.238c-12.762-6.923-20.224 11.48-11.485 14.344 8.74 2.864 11.484-4.54 8.77-7.659"
      />
    </g>
  </svg>
);

Snail.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Snail);
export default Memo;
