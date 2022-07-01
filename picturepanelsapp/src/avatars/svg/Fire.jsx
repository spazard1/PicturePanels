/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Fire = (props) => (
  <svg viewBox="-3 -3 42 42" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.colors[1] ? props.colors[1] : props.colors[0]?.darken(0.3)}
      d="M35 19a16.96 16.96 0 0 0-1.04-5.868c-.46 5.389-3.333 8.157-6.335 6.868-2.812-1.208-.917-5.917-.777-8.164.236-3.809-.012-8.169-6.931-11.794 2.875 5.5.333 8.917-2.333 9.125-2.958.231-5.667-2.542-4.667-7.042-3.238 2.386-3.332 6.402-2.333 9 1.042 2.708-.042 4.958-2.583 5.208-2.84.28-4.418-3.041-2.963-8.333A16.936 16.936 0 0 0 1 19c0 9.389 7.611 17 17 17s17-7.611 17-17z"
    />
    <path
      fill={props.colors[0]}
      d="M28.394 23.999c.148 3.084-2.561 4.293-4.019 3.709-2.106-.843-1.541-2.291-2.083-5.291s-2.625-5.083-5.708-6c2.25 6.333-1.247 8.667-3.08 9.084-1.872.426-3.753-.001-3.968-4.007A11.964 11.964 0 0 0 6 30c0 .368.023.73.055 1.09C9.125 34.124 13.342 36 18 36s8.875-1.876 11.945-4.91c.032-.36.055-.722.055-1.09 0-2.187-.584-4.236-1.606-6.001z"
    />
  </svg>
);

Fire.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Fire);
export default Memo;
