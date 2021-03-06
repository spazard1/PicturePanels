/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Tree = (props) => (
  <svg viewBox="-2 -2 40 40" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill={"#662113"} d="M22 33c0 2.209-1.791 3-4 3s-4-.791-4-3l1-9c0-2.209.791-2 3-2s3-.209 3 2l1 9z" />
    <path fill={props.colors[0]} d="M34 17c0 8.837-7.163 12-16 12-8.836 0-16-3.163-16-12C2 8.164 11 0 18 0s16 8.164 16 17z" />
    <g fill={props.colors[1] ?? props.colors[0]?.darken(0.3)}>
      <ellipse cx={6} cy={21} rx={2} ry={1} />
      <ellipse cx={30} cy={21} rx={2} ry={1} />
      <ellipse cx={10} cy={25} rx={2} ry={1} />
      <ellipse cx={14} cy={22} rx={2} ry={1} />
      <ellipse cx={10} cy={16} rx={2} ry={1} />
      <ellipse cx={7} cy={12} rx={2} ry={1} />
      <ellipse cx={29} cy={12} rx={2} ry={1} />
      <ellipse cx={14} cy={10} rx={2} ry={1} />
      <ellipse cx={22} cy={10} rx={2} ry={1} />
      <ellipse cx={26} cy={16} rx={2} ry={1} />
      <ellipse cx={18} cy={17} rx={2} ry={1} />
      <ellipse cx={22} cy={22} rx={2} ry={1} />
      <ellipse cx={18} cy={26} rx={2} ry={1} />
      <ellipse cx={26} cy={25} rx={2} ry={1} />
    </g>
  </svg>
);

Tree.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Tree);
export default Memo;
