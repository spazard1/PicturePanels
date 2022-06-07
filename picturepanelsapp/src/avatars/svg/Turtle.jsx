/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Turtle = (props) => (
  <svg viewBox="0 0 64 64" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="none" fillRule="evenodd">
      <ellipse cx={32} cy={11} fill={props.colors[1] ?? "#80D25B"} rx={7} ry={9} />
      <path
        fill={props.colors[1] ?? "#80D25B"}
        d="M20.302 46s-3.169 9.881.38 13.782c3.55 3.9 6.119 3.433 6.119-6.04 0-9.474-6.499-7.742-6.499-7.742ZM43.498 46s3.169 9.881-.38 13.782c-3.55 3.9-6.119 3.433-6.119-6.04C37 44.267 43.498 46 43.498 46ZM20.623 21.222s-6.667-5.838-10.531-5.169C6.228 16.723 6 22.213 6 24c0 1.787 1.79 13.317 3.787 12.498 1.998-.82 3.954-8.538 3.954-8.538s1.91 2.27 4.868 2.504M43 21.222s6.667-5.838 10.531-5.169c3.864.67 4.092 6.16 4.092 7.946 0 1.787-1.79 13.317-3.787 12.498-1.998-.82-3.954-8.538-3.954-8.538s-1.91 2.27-4.868 2.504"
      />
      <path
        fill={props.colors[0]}
        stroke="#595959"
        strokeLinecap="round"
        strokeWidth={2}
        d="M32 53c8.837 0 16-8.507 16-19s-1.319-17-16-17c-14.681 0-16 6.507-16 17s7.163 19 16 19Z"
      />
      <path fill={props.colors[0]} stroke="#595959" strokeLinecap="round" strokeWidth={2} d="m32 22 6.928 4v8L32 38l-6.928-4v-8z" />
      <path
        stroke="#595959"
        strokeLinecap="round"
        strokeWidth={2}
        d="M30 8a2 2 0 0 0-2 2M34 8a2 2 0 0 1 2 2M32.12 38.188v14.225m-.104-30.666V17m-6.802 9.004-7.477-2.932m7.388 11.081-8.36 4.735M38.737 26.004l7.477-2.932M38.766 34.153l8.36 4.735"
      />
    </g>
  </svg>
);

Turtle.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Turtle);
export default Memo;
