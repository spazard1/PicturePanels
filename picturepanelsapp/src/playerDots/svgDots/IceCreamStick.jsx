/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./SvgDots.css";

const defaultColor2 = "#282b24";

const IceCreamStick = (props) => (
  <svg className="playerDotSvg" viewBox="-8.9 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g data-name="ice cream2">
      <g data-name="Group 178">
        <g data-name="Group 177">
          <path data-name="Path 179" d="M8.111 23.469v7.01a1.021 1.021 0 1 1-2.042 0v-7.01" fill="#f9cb99" />
        </g>
        <path
          data-name="Path 180"
          d="M7.09 32a1.522 1.522 0 0 1-1.521-1.521v-7.01a.5.5 0 1 1 1 0v7.01a.521.521 0 1 0 1.042 0v-7.01a.5.5 0 1 1 1 0v7.01A1.522 1.522 0 0 1 7.09 32Z"
          fill="#282b24"
        />
      </g>
      <path data-name="Path 181" d="M7.101.5a6.6 6.6 0 0 0-6.6 6.6v16.334h13.2V7.106A6.6 6.6 0 0 0 7.101.5Z" fill={props.colors[0]} />
      <g data-name="Group 180" opacity={0.35}>
        <g data-name="Group 179">
          <path data-name="Path 182" d="M2 8.606a6.594 6.594 0 0 1 10.454-5.353A6.6 6.6 0 0 0 .5 7.106V23.44H2Z" fill="#fff" />
        </g>
      </g>
      <g data-name="Group 182">
        <g data-name="Group 181">
          <path
            data-name="Path 183"
            d="M13.703 23.935H.503a.5.5 0 0 1-.5-.5V7.106a7.1 7.1 0 0 1 14.2 0V23.44a.5.5 0 0 1-.5.495Zm-12.7-1h12.2V7.106a6.1 6.1 0 0 0-12.2 0Z"
            fill="#282b24"
          />
        </g>
      </g>
      <g data-name="Group 184">
        <g data-name="Group 183" transform="translate(-296.876 -81.994)">
          <rect
            data-name="Rectangle 13"
            width={1}
            height={13.952}
            rx={0.5}
            transform="translate(301.121 88.211)"
            fill={props.colors[1] ?? defaultColor2}
          />
        </g>
      </g>
      <g data-name="Group 186">
        <g data-name="Group 185" transform="translate(-296.876 -81.994)">
          <rect
            data-name="Rectangle 14"
            width={1}
            height={13.952}
            rx={0.5}
            transform="translate(305.812 88.211)"
            fill={props.colors[1] ?? defaultColor2}
          />
        </g>
      </g>
    </g>
  </svg>
);

IceCreamStick.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const Memo = memo(IceCreamStick);
export default Memo;
