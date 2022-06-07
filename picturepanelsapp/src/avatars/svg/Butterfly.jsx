/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Butterfly = (props) => (
  <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="none" fillRule="evenodd">
      <path stroke={props.colors[1] ?? "#979797"} strokeLinecap="round" d="M31.766 26.1S36.636 9.738 41.41 6M29.41 26.1S24.54 9.738 19.765 6" />
      <circle cx={42.266} cy={5.5} r={1.5} fill="#D8D8D8" />
      <circle cx={19.266} cy={5.5} r={1.5} fill="#D8D8D8" />
      <path
        fill={props.colors[0]}
        d="M30.766 31.961s11.827-15.274 18.7-14.956c6.872.318 4.932 21.584 3.117 23.84-1.815 2.255-9.305 4.792-9.305 4.792s5.716 2.307 5.716 7.287-5.08 10.6-11.174 4.353c-6.094-6.247-6.507-12.428-6.507-12.428M30.532 31.961s-11.827-15.274-18.7-14.956c-6.873.318-4.932 21.584-3.117 23.84 1.815 2.255 9.305 4.792 9.305 4.792s-5.716 2.307-5.716 7.287 5.08 10.6 11.174 4.353c6.094-6.247 6.507-12.428 6.507-12.428"
      />
      <circle cx={30.766} cy={27} r={2} fill="#595959" />
      <ellipse cx={30.766} cy={39} fill="#595959" rx={2} ry={11} />
    </g>
  </svg>
);

Butterfly.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Butterfly);
export default Memo;
