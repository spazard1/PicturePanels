/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Tulip = (props) => (
  <svg
    id="Uploaded to svgrepo.com"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className="playerAvatarSvg"
    style={{
      enableBackground: "new 0 0 32 32",
    }}
    xmlSpace="preserve"
    {...props}
  >
    <path
      d="M9.5 3.866V10.5c0 3.309 2.691 6 6 6a6.007 6.007 0 0 0 5.993-5.715L9.5 3.866z"
      style={{
        fill: props.colors[0],
      }}
    />
    <path
      d="m15.5 27.302-.481-1.704c-1.467-5.193-6.157-8.868-11.511-9.088C3.729 23.489 8.494 28.5 15 28.5h1c6.506 0 11.271-5.011 11.492-11.99-5.354.22-10.043 3.895-11.511 9.088l-.481 1.704z"
      style={{
        fill: props.colors[1] ?? "#6f9b45",
      }}
    />
    <path
      d="m15.5 7.327 6-3.462V10.5c0 .113-.001.174-.007.285L15.5 7.327z"
      style={{
        fill: props.colors[0]?.rotate(45),
      }}
    />
    <path
      d="M16 23.999v-7.031c3.355-.257 6-3.047 6-6.467V3l-6.5 3.75L9 3v7.5c0 3.42 2.645 6.211 6 6.467v7.031C13.04 19.302 8.407 16 3 16c0 7.18 4.82 13 12 13h1c7.18 0 12-5.82 12-13-5.407 0-10.04 3.302-12 7.999zm-8.947.527c-1.759-1.968-2.812-4.594-3.016-7.482 5.803.499 10.44 5.147 10.922 10.956-3.151-.01-5.883-1.211-7.906-3.474zM21 4.731v5.192l-4.5-2.596L21 4.731zm-11 0 10.972 6.33v.002A5.5 5.5 0 0 1 10 10.5V4.731zM16.041 28c.482-5.809 5.119-10.457 10.923-10.956-.437 6.395-4.893 10.935-10.923 10.956z"
      style={{
        fill: "#231f20",
      }}
    />
  </svg>
);

Tulip.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Tulip);
export default Memo;
