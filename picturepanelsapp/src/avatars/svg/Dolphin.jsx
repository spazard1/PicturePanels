/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Dolphin = (props) => (
  <svg viewBox="-3 -3 42 42" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.colors[0]}
      d="M30.584 7.854A10.437 10.437 0 0 1 33.559 2c.704-.704.25-2-1-2 0 0-6.061.007-9.893 3.327A15.003 15.003 0 0 0 19.559 3c-8 0-12 4-14 12-.444 1.778-.865 1.399-3 3-1.195.896-2.117 3 1 3 3 0 5 .954 9 1 3.629.042 9.504-3.229 11.087-1.292 2.211 2.706 1.396 5.438.597 6.666-2.904 3.396-5.939.541-8.685-.374-3-1-1 1 0 2s1.312 4 0 6 3 0 5-3c.011-.017.022-.028.032-.045C28.392 31.5 34.559 25.936 34.559 18c0-3.918-1.515-7.474-3.975-10.146z"
    />
    <circle fill="#1F2326" cx={13.117} cy={14} r={2} />
    <path
      fill={props.colors[1] ? props.colors[1] : props.colors[0]?.lighten(0.3)}
      d="M10.396 21.896s4-.876 7.167-2.688c4.625-2.646 7.26-2.594 8.885-.823s1.99 6.594-2.885 9.677c2.604-2.75 1.146-8.349-2.014-7.588-8.153 1.964-8.903 1.547-11.153 1.422z"
    />
    <path
      fill={props.colors[0]}
      d="m19.383 17.744-2.922 1.285a.54.54 0 0 0-.412.561c.122 1.504.756 3.625 2.263 4.629 2.354 1.569 2.367 1.897 3 0 .768-2.303-.182-4.462-1.333-6.24a.553.553 0 0 0-.596-.235z"
    />
  </svg>
);

Dolphin.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Dolphin);
export default Memo;
