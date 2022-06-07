/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Frog = (props) => (
  <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="none" fillRule="evenodd">
      <path
        fill={props.colors[0]}
        d="M20.87 56.049c-1.8-1.604-3.95-4.498-5.833-8.04-3.209-6.034-4.426-11.661-2.72-12.569 1.707-.907 5.692 3.249 8.9 9.283 1.954 3.675 3.17 7.2 3.436 9.598l2.5-1.142 6.672 7H14.826c-1.657 0-1.773-.56-.279-1.243l6.323-2.887Z"
      />
      <path
        fill={props.colors[0]}
        d="M45.5 56.049c1.8-1.604 3.95-4.498 5.833-8.04 3.209-6.034 4.426-11.661 2.72-12.569-1.707-.907-5.692 3.249-8.9 9.283-1.954 3.675-3.17 7.2-3.436 9.598l-2.5-1.142-6.672 7h18.999c1.657 0 1.773-.56.279-1.243L45.5 56.05Z"
      />
      <path
        fill={props.colors[1] ?? props.colors[0]?.rotate(90)}
        d="M33 60.21c9.389 0 17-7.821 17-17.21 0-9.389-7.611-17-17-17s-17 7.611-17 17 7.611 17.21 17 17.21Z"
      />
      <ellipse cx={21} cy={8.5} fill={props.colors[0]} rx={6} ry={6.5} />
      <ellipse cx={45} cy={8.5} fill={props.colors[0]} rx={6} ry={6.5} />
      <circle cx={33} cy={22} r={19} fill={props.colors[0]} />
      <ellipse cx={21} cy={9} fill="#595959" rx={4} ry={5} />
      <circle cx={21} cy={7} r={1} fill="#FFF" />
      <ellipse cx={45} cy={9} fill="#595959" rx={4} ry={5} />
      <circle cx={45} cy={7} r={1} fill="#FFF" />
      <path
        stroke={props.colors[1] ?? props.colors[0]?.rotate(90)}
        strokeLinecap="round"
        strokeWidth={2}
        d="M19.973 29.454s6.6 2.087 13.199 2.087 13.198-2.087 13.198-2.087"
      />
    </g>
  </svg>
);

Frog.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Frog);
export default Memo;
