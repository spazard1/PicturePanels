/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Starfish = (props) => (
  <svg viewBox="0 0 500 500" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <style>{".starfish{fill:" + (props.colors[1] ? props.colors[1] : props.colors[0]?.lighten(0.4)) + "}"}</style>
    <g id="starfish">
      <path
        d="m255.82 34.2 40.6 124.95c7.25 22.32 28.05 37.42 51.51 37.42h115.38c10.97 0 15.52 14.03 6.65 20.48l-93.34 67.82c-18.98 13.79-26.93 38.24-19.68 60.55l35.65 109.73c3.39 10.43-8.55 19.1-17.42 12.66L281.84 400c-18.98-13.79-44.69-13.79-63.67 0l-93.34 67.82c-8.87 6.45-20.81-2.23-17.42-12.66l35.65-109.73c7.25-22.32-.69-46.76-19.68-60.55l-93.34-67.82c-8.87-6.45-4.31-20.48 6.65-20.48h115.38c23.46 0 44.26-15.11 51.51-37.42l40.6-124.95c1.83-5.64 9.81-5.64 11.64-.01z"
        style={{
          fill: props.colors[0],
        }}
      />
      <circle className="starfish" cx={249.84} cy={279.66} r={29.66} />
      <circle className="starfish" cx={249.84} cy={192.86} r={17.8} />
      <circle className="starfish" cx={249.84} cy={130.04} r={10.76} />
      <circle className="starfish" cx={249.84} cy={77.39} r={7.61} />
      <circle className="starfish" cx={330.76} cy={253.04} r={17.8} />
      <circle className="starfish" cx={389.65} cy={231.14} r={10.76} />
      <circle className="starfish" cx={438.99} cy={212.8} r={7.61} />
      <circle className="starfish" cx={169.24} cy={250.99} r={17.8} />
      <circle className="starfish" cx={110.35} cy={229.09} r={10.76} />
      <circle className="starfish" cx={61.01} cy={212.8} r={7.61} />
      <circle className="starfish" cx={297.89} cy={349.72} r={17.8} />
      <circle className="starfish" cx={337.72} cy={398.31} r={10.76} />
      <circle className="starfish" cx={198.13} cy={344.71} r={17.8} />
      <circle className="starfish" cx={161.86} cy={396.01} r={10.76} />
      <circle className="starfish" cx={131.47} cy={438.99} r={7.61} />
      <circle className="starfish" cx={365.09} cy={431.61} r={7.23} />
    </g>
  </svg>
);

Starfish.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Starfish);
export default Memo;
