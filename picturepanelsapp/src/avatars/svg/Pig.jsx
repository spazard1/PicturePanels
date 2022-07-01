/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Pig = (props) => (
  <svg viewBox="-3 -3 42 42" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.colors[0]}
      d="M34.193 13.329a5.975 5.975 0 0 0 1.019-1.28c1.686-2.854.27-10.292-.592-10.8-.695-.411-5.529 1.05-8.246 3.132C23.876 2.884 21.031 2 18 2c-3.021 0-5.856.879-8.349 2.367C6.93 2.293 2.119.839 1.424 1.249c-.861.508-2.276 7.947-.592 10.8.278.471.615.884.989 1.249C.666 15.85 0 18.64 0 21.479 0 31.468 8.011 34 18 34s18-2.532 18-12.521c0-2.828-.66-5.606-1.807-8.15z"
    />
    <path
      fill={props.colors[1] ? props.colors[1] : props.colors[0]?.lighten(0.3)}
      d="M7.398 5.965c-2.166-1.267-4.402-2.08-4.8-1.845-.57.337-1.083 4.998-.352 8.265a20.365 20.365 0 0 1 5.152-6.42zm26.355 6.419c.733-3.267.219-7.928-.351-8.265-.398-.235-2.635.578-4.801 1.845a20.345 20.345 0 0 1 5.152 6.42zM28 23.125c0 4.487-3.097 9.375-10 9.375-6.904 0-10-4.888-10-9.375S11.096 17.5 18 17.5c6.903 0 10 1.138 10 5.625z"
    />
    <path
      fill="#662113"
      d="M15 24.6c0 1.857-.34 2.4-1.5 2.4s-1.5-.543-1.5-2.4c0-1.856.34-2.399 1.5-2.399s1.5.542 1.5 2.399zm9 0c0 1.857-.34 2.4-1.5 2.4s-1.5-.543-1.5-2.4c0-1.856.34-2.399 1.5-2.399s1.5.542 1.5 2.399z"
    />
    <circle fill="#292F33" cx={7} cy={17} r={2} />
    <circle fill="#292F33" cx={29} cy={17} r={2} />
  </svg>
);

Pig.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Pig);
export default Memo;
