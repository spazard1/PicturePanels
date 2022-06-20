/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Rosette = (props) => (
  <svg className="playerAvatarSvg" viewBox="4 4 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.colors[0]}
      stroke={props.colors[0]}
      strokeMiterlimit={10}
      strokeWidth={2}
      d="M35.465 10C29.8 10 25.2 17.196 25.055 26.155c-8.499.45-15.176 4.921-15.176 10.38 0 5.465 6.693 9.94 15.206 10.38.441 8.513 4.916 15.206 10.38 15.206 5.458 0 9.93-6.677 10.38-15.176C54.804 46.801 62 42.201 62 36.535c0-5.66-7.18-10.256-16.125-10.41C45.721 17.18 41.125 10 35.465 10Z"
    />
    <path
      fill={props.colors[0]?.lighten(0.4).rotate(-20)}
      d="M53.197 18.174c-3.76-3.76-11.587-2.037-17.627 3.812-5.938-5.34-13.335-6.805-16.957-3.183-3.626 3.626-2.154 11.036 3.202 16.978-5.356 5.94-6.828 13.351-3.202 16.977 3.622 3.622 11.02 2.158 16.957-3.183 6.04 5.849 13.867 7.571 17.627 3.812 3.755-3.755 2.04-11.569-3.792-17.606 5.832-6.038 7.547-13.851 3.792-17.607Z"
    />
    <circle
      cx={35.591}
      cy={35.781}
      r={8.003}
      fill={props.colors[1] ? props.colors[1] : "#f4aa41"}
      stroke="#f4aa41"
      strokeMiterlimit={10}
      strokeWidth={2}
    />
    <circle
      cx={35.591}
      cy={35.781}
      r={4.446}
      fill={props.colors[1] ? props.colors[1].rotate(30) : "#f4aa41"}
      stroke="#fcea2b"
      strokeMiterlimit={10}
      strokeWidth={2}
    />
    <g fill="none" stroke="#222" strokeLinejoin="round" strokeWidth={2}>
      <path
        strokeLinecap="round"
        d="M53.197 18.174c-3.76-3.76-11.587-2.037-17.627 3.812-5.938-5.34-13.335-6.805-16.957-3.183-3.626 3.626-2.154 11.036 3.202 16.978-5.356 5.94-6.828 13.351-3.202 16.977 3.622 3.622 11.02 2.158 16.957-3.183 6.04 5.849 13.867 7.571 17.627 3.812 3.755-3.755 2.04-11.569-3.792-17.606 5.832-6.038 7.547-13.851 3.792-17.607ZM58.547 42.897A8.312 8.312 0 0 0 62 36.535c0-2.575-1.485-4.929-3.947-6.745M28.391 57.71c1.857 2.738 4.342 4.411 7.075 4.411a8.306 8.306 0 0 0 6.35-3.436M13.125 30.343a8.207 8.207 0 0 0-3.246 6.192 7.855 7.855 0 0 0 2.566 5.57M42.077 13.77c-1.797-2.356-4.1-3.77-6.611-3.77a8.302 8.302 0 0 0-6.349 3.435"
      />
      <circle cx={35.591} cy={35.781} r={8.003} />
      <circle cx={35.591} cy={35.781} r={4.446} />
    </g>
  </svg>
);

Rosette.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Rosette);
export default Memo;
