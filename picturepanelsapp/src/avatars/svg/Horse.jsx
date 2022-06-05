/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Horse = (props) => (
  <svg viewBox="0 0 72 72" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.colors[0]}
      d="m22.754 11.085 1.667 7.167-5.333 5.333-8.334 14.334 1 4.667 2.167 1.333 4-.167 3.5-3.333 6.833-1.833s1.334 1.5 2.167 3 3.667 4.166 3.667 4.166l.5 6-1.833 6.167-2 2.833s22 9.5 33.166-7l-.5-6-1.833-5-3.333-5.167-1-1.5-.167-5.166-2.833-5.334-5-3-2.667-4.5-5.167-4.166-6.5-1.5-5.666 1-4.167-2.167-2.334-.167z"
    />
    <path
      fill={props.colors[1] ? props.colors[1] : props.colors[0]?.darken(0.25)}
      d="M64.71 62.721c-.962-2.384-.576-5.63-.145-7.382a8.023 8.023 0 0 0 .138-3.26c-1.479-8.712-6.998-15.119-6.998-15.119l-.42 1.807c1.074-6.526-2.156-11.307-2.156-11.307l-5.208-4.095-.118.605c-2.28-6.557-10.049-9.992-10.049-9.992l-10.767-.137 2.46 4.066 5.792 2.08 3.532 2.841 2.276 4.313.283 4.893-1.417 5.642-.325 6.034 1.583 4.765c2.32 7.115 7.772 7.284 9.416 7.164l.037.785c.005.107.018.217.042.321 1.012 4.44 6.547 7.32 10.256 8.088 1.227.254 2.258-.95 1.789-2.112zM52.243 49.456l.218-.354-.218.354zm-.153 4.734.449.373.014.297c-.157-.223-.318-.445-.463-.67zm-.37-3.88c-.058.093-.062.1 0 0zm.02-.034.344-.56-.343.56zm4.498-7.255-2.168 4.015c.22-.58.459-1.163.734-1.755a18.743 18.743 0 0 0 1.974-4.335l-.391 1.684a1.573 1.573 0 0 1-.149.391zM52.67 48.76l.251-.41-.251.41zm.798-1.3.445-.726-.445.725zm.86-1.403.19-.31-.19.31zm.39-.635.014-.024-.015.024z"
    />
    <path
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="M57.205 36.868c1.768 2.362 6.545 6.682 6.045 16.238M31.25 40.97s8.478 6.783 0 18.765"
    />
    <path
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="M33.946 29.955c.55 8.355-9.322 9.703-11.954 10.335-.332.08-.632.25-.873.492l-2.223 2.222c-.35.35-.824.546-1.318.546h-3.512a2.795 2.795 0 0 1-2.651-1.911l-.531-1.593a2.795 2.795 0 0 1 .255-2.322l8.786-14.643 4.724-4.724-2.116-6.906s7.803-.698 8.414 5.331c0 0 16.928 2.442 10.553 19.383 0 0-1.625 5.949 2.375 11.185"
    />
    <path
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="M29.667 13.106s22.244-4.02 19.958 19.959"
    />
    <path
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="M48.669 22.24s14.766 6.587 5.456 22.22c0 0-5.375 6.563.625 13.605"
    />
    <circle cx={23.167} cy={28.016} r={2} />
  </svg>
);

Horse.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Horse);
export default Memo;
