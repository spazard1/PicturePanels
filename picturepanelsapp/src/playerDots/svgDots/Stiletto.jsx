/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import complementaryColors from "complementary-colors";
import "./SvgDots.css";

const Stiletto = (props) => {
  let color2;
  if (props.colors.length === 1) {
    const originalColor = new complementaryColors(props.colors[0]);
    const analogous = originalColor.triad();
    color2 = "rgb(" + analogous[1].r + " " + analogous[1].g + " " + analogous[1].b + ")";
  } else {
    color2 = props.colors[1];
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      viewBox="0 0 2048 2048"
      className="playerDotSvg"
      style={{
        shapeRendering: "geometricPrecision",
        textRendering: "geometricPrecision",
        imageRendering: "optimizeQuality",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }}
      {...props}
    >
      <defs>
        <style>{".fil1{fill:" + color2 + ";fill-rule:nonzero}"}</style>
      </defs>
      <g>
        <path
          d="M1490 823c-2-17 10-33 27-36l206-146c9-15 28-21 44-12 15 9 21 28 12 44-142 247-125 577-111 847 4 78 8 151 7 217 0 16-11 30-28 33-17 2-33-10-36-27l-122-920z"
          style={{
            fill: props.colors[0],
            fillRule: "nonzero",
          }}
        />
        <path className="fil1" d="M1676 1732v5c0 16-11 30-28 33-17 2-33-10-36-27l-1-11h65z" />
        <path
          d="M1080 830c115-278 168-467 474-547 70-18 153-32 159 10 7 46 23 87 38 126 24 62 46 122 40 202-3 39-15 72-44 100-27 25-67 44-127 55-218 38-310 273-399 501-100 256-198 506-467 506-129 0-188-1-245-3-49-1-97-2-202-2-15 0-28-10-31-25-26-121-30-255 6-357 14-41 35-76 64-104 29-29 66-50 111-59 59-13 132-6 222 26 195 69 296-175 402-428z"
          style={{
            fill: props.colors[0],
            fillRule: "nonzero",
          }}
        />
        <path
          d="M1080 830c77-186 126-332 241-432 26-19 55-36 86-48 103-38 217-68 255-70 64-3-81 66-88 69-102 45-247 118-369 343-90 166-107 432-302 595-30 25-82 44-119 37-60-12-2-51 26-68 115-52 191-236 270-426z"
          style={{
            fill: color2,
            fillRule: "nonzero",
          }}
        />
        <path className="fil1" d="M929 1738c-49 28-106 44-174 44-129 0-188-1-245-3-49-1-97-2-202-2-15 0-28-10-31-25-1-5-2-9-3-14h655z" />
        <path
          style={{
            fill: "none",
          }}
          d="M0 0h2048v2048H0z"
        />
      </g>
    </svg>
  );
};

Stiletto.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const Memo = memo(Stiletto);
export default Memo;
