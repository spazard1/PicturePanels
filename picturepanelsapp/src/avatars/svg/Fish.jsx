/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Fish = (props) => {
  const color2 = props.colors[1] ? props.colors[1] : props.colors[0]?.darken(0.25);

  return (
    <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <path
          fill={color2}
          d="M43.548 14.887s13.005 9.39 3 17.058c-10.006 7.668-3-17.058-3-17.058ZM9.902 25.793l10.622-14.969 1.568 2.182L39.02 1.399l-.142 6.676z"
        />
        <path fill={color2} d="M60.63 26S47.33 27.527 43 37.47c0 0 .65 11.17 12.884 11.271C51.815 32.031 60.63 26 60.63 26Z" />
        <path
          fill={props.colors[0]}
          d="M2.362 29.872s18.683-9.658 23.723-16.31C31.125 6.907 53.4 4.126 53.4 4.126s-11.689 9.687-9.048 24.338c2.64 14.651-7.142 26.01-7.142 26.01s-12.952-4.487-18.548-8.438c-5.596-3.95-16.301-16.165-16.301-16.165Z"
        />
        <circle cx={14} cy={30} r={3} fill="#595959" />
        <path
          fill={color2}
          d="M14 39s2.124 5.01 4.008 10.235 9.872 9.768 11.719 8.362c1.847-1.406-2.04-5.945-2.965-10.55C25.838 42.44 14 39 14 39Z"
        />
      </g>
    </svg>
  );
};

Fish.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Fish);
export default Memo;
