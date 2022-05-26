/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import complementaryColors from "complementary-colors";
import "./Avatars.css";

const Ring = (props) => {
  let color2;
  let color3;
  let color4;
  if (props.colors.length === 1) {
    color2 = "#c2185b";
    color3 = "#ad1457";
    color4 = "#ec407a";
  } else {
    const originalColor = new complementaryColors(props.colors[1]);
    color2 = props.colors[1];
    const analogous = originalColor.analogous();
    color3 = "rgb(" + analogous[1].r + " " + analogous[1].g + " " + analogous[1].b + ")";
    color4 = "rgb(" + analogous[2].r + " " + analogous[2].g + " " + analogous[2].b + ")";
  }

  const outerColorAnalogous = new complementaryColors(props.colors[0]).analogous();
  const outerColor = "rgb(" + outerColorAnalogous[1].r + " " + outerColorAnalogous[1].g + " " + outerColorAnalogous[1].b + ")";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      viewBox="0 0 2048 2048"
      className="playerAvatarSvg"
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
        <style>{".fil4{fill:" + color3 + "}.fil5{fill:" + color4 + "}"}</style>
      </defs>
      <g>
        <path
          d="M1278 451c133 51 247 142 328 259 80 117 123 255 123 398 0 187-74 366-206 498-133 133-311 206-498 206s-366-74-498-206c-133-133-206-311-206-498 0-142 43-280 123-398 80-117 195-208 328-259l56-22 14 58c10 42 33 79 67 105 34 27 75 41 118 41s84-14 118-41c33-27 57-64 67-105l14-58 56 22zm-37 139c-46 76-111 113-179 124-110 17-208-45-265-122-200 104-366 283-373 517-2 80 14 160 45 233 31 71 76 136 131 191 113 113 265 176 425 176s312-63 425-176 178-264 176-424c-2-127-47-246-129-343-60-71-164-146-254-175z"
          style={{
            fill: outerColor,
          }}
        />
        <path
          d="M1271 469c130 50 241 139 318 252 75 110 120 243 120 386 0 189-77 360-200 484-124 124-295 200-484 200s-360-77-484-200c-124-124-200-295-200-484 0-143 44-276 120-386 78-113 188-202 318-252l34-13 8 36c11 47 37 88 74 117 36 28 81 45 130 45s94-17 130-45c36-29 63-70 74-117l8-36 34 13zm-23 107c-57 180-359 139-464-2-251 125-368 322-380 534 0 171 69 326 182 439 112 112 267 182 439 182 171 0 326-69 439-182 112-112 182-267 182-439-8-288-222-483-396-532z"
          style={{
            fill: props.colors[0],
            fillRule: "nonzero",
          }}
        />
        <path
          d="M1024 256c71 0 136 6 185 32 54 28 88 76 88 156 0 75-31 144-80 193s-118 80-193 80-144-31-193-80-80-118-80-193c0-81 34-129 88-156 49-25 114-32 185-32zm153 87c-38-18-92-23-153-23s-115 5-153 23c-25 12-44 32-52 62l206 30 204-30c-8-30-26-50-52-62z"
          style={{
            fill: "#78909c",
            fillRule: "nonzero",
          }}
        />
        <path
          d="M843 285c53-27 122-29 181-29s128 3 181 29c64 32 83 66 89 109 3 20 3 43 4 68l-273 83-273-83c-3-69 5-133 92-177z"
          style={{
            fill: color2,
          }}
        />
        <path
          className="fil4"
          d="m776 470 41 13 205 62-79-121-57-87-35-55c-3 1-6 3-8 4-72 36-90 86-92 141-1 12 0 24 0 36l25 8zM1108 423l-78 121 201-61 42-13 24-7h1v-8c-1-16-1-31-2-44 0-5-1-10-2-15-6-44-24-77-89-109l-6-3-35 54-56 86z"
        />
        <path className="fil5" d="M849 279c135 167 76 78 176 268-135-167-76-78-176-268zM1201 279c-135 167-76 78-176 268 135-167 76-78 176-268z" />
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

Ring.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const Memo = memo(Ring);
export default Memo;
