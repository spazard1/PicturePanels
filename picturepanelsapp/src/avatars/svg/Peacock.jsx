/* eslint-disable max-len */
import * as React from "react";
import { memo } from "react";
import PropTypes from "prop-types";
import "./Avatars.css";

const Peacock = (props) => (
  <svg viewBox="0 0 72 72" className="playerAvatarSvg" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx={22.25} cy={36.98} r={1.5} />
    <circle cx={49.75} cy={36.98} r={1.5} />
    <circle cx={28.75} cy={32} r={1.5} />
    <circle cx={43.68} cy={31.91} r={1.5} />
    <circle cx={22.25} cy={47.54} r={1.5} />
    <circle cx={49.75} cy={47.54} r={1.5} />
    <circle cx={28.75} cy={42.57} r={1.5} />
    <circle cx={43.68} cy={42.48} r={1.5} />
    <circle cx={22.25} cy={27.16} r={1.5} />
    <circle cx={36} cy={17.47} r={1.5} />
    <circle cx={49.75} cy={26.66} r={1.5} />
    <circle cx={28.75} cy={22.26} r={1.5} />
    <circle cx={43.34} cy={22.26} r={1.5} />
    <path
      fill={props.colors[0]}
      d="M41.284 56.564s3.785 1.512 4.646.927c.76-.517 0-3.674 0-3.674s4.276 2.12 5.162 1.14c.797-.882-1.49-4.515-1.49-4.515s5.04-.413 5.46-1.787c.332-1.082-2.78-3.574-2.78-3.574s6.539-.935 6.454-2.68c-.075-1.529-5.857-1.787-5.857-1.787s6.344-1.664 6.353-3.474c.007-1.167-4.07-2.283-4.07-2.283s4.81-2.112 4.666-3.574C59.724 30.22 56 29.397 56 29.397s3.458-3.744 2.737-4.964c-.606-1.026-4.765 0-4.765 0s2.505-4.54 1.49-5.56c-1.233-1.235-6.459.696-6.459.696s1.326-4.27.005-5.063c-1.288-.774-5.162 3.077-5.162 3.077s1.224-3.467-.463-4.956c-1.582-1.396-4.426 1.489-4.426 1.489S37.159 10.344 36 10.344s-2.956 4.268-2.956 4.268-2.202-3.033-4.156-2.382c-1.489.496-.734 5.353-.734 5.353s-3.874-3.851-5.162-3.077c-1.32.793-.557 4.97-.557 4.97s-4.64-1.815-5.896-.602c-1.55 1.496 1.49 5.559 1.49 5.559s-4.16-1.026-4.766 0c-.72 1.22 2.737 4.963 2.737 4.963s-3.724.825-3.829 1.886c-.144 1.463 4.666 3.574 4.666 3.574s-4.077 1.117-4.07 2.284c.01 1.81 4.383 2.865 4.383 2.865s-3.812.867-3.887 2.396c-.085 1.745 6.453 2.68 6.453 2.68s-3.11 2.491-2.78 3.574c.42 1.373 5.46 1.787 5.46 1.787s-2.286 3.633-1.49 4.515c.887.98 5.163-1.14 5.163-1.14s-.76 3.157 0 3.673c.861.585 4.507-.788 4.507-.788l1.844-1.368 7.198.02Z"
    />
    <path
      fill={props.colors[1] ? props.colors[1] : props.colors[0]?.rotate(180)}
      d="M34.892 22.601a3.136 3.136 0 0 1 3.075 2.196c1.304 3.145-.204 10.255.348 13.615.43 2.607 4.276 7.02 4.283 9.663.011 4.83-3.533 7.925-6.598 7.883-4.215-.057-6.547-5.314-6.598-7.883-.065-3.294 3.4-7.173 4.283-9.663.837-2.361 1.576-9.115.076-10.502-.631-.583-4.359-.588-4.359-.588s3.185-4.72 5.49-4.72Z"
    />
    <circle cx={22.249} cy={36.979} r={1.5} fill="#fcea2b" />
    <circle cx={22.249} cy={37.479} r={1} fill="#1e50a0" />
    <circle cx={49.751} cy={36.979} r={1.5} fill="#fcea2b" />
    <circle cx={49.751} cy={37.479} r={1} fill="#1e50a0" />
    <circle cx={28.752} cy={32} r={1.5} fill="#fcea2b" />
    <circle cx={28.752} cy={32.5} r={1} fill="#1e50a0" />
    <circle cx={43.676} cy={31.912} r={1.5} fill="#fcea2b" />
    <circle cx={43.676} cy={32.412} r={1} fill="#1e50a0" />
    <circle cx={22.249} cy={47.544} r={1.5} fill="#fcea2b" />
    <circle cx={22.249} cy={48.044} r={1} fill="#1e50a0" />
    <circle cx={49.751} cy={47.544} r={1.5} fill="#fcea2b" />
    <circle cx={49.751} cy={48.044} r={1} fill="#1e50a0" />
    <circle cx={28.752} cy={42.565} r={1.5} fill="#fcea2b" />
    <circle cx={28.752} cy={43.065} r={1} fill="#1e50a0" />
    <circle cx={43.676} cy={42.477} r={1.5} fill="#fcea2b" />
    <circle cx={43.676} cy={42.977} r={1} fill="#1e50a0" />
    <circle cx={22.249} cy={27.157} r={1.5} fill="#fcea2b" />
    <circle cx={22.249} cy={27.657} r={1} fill="#1e50a0" />
    <circle cx={36} cy={17.468} r={1.5} fill="#fcea2b" />
    <circle cx={36} cy={17.968} r={1} fill="#1e50a0" />
    <circle cx={49.751} cy={26.657} r={1.5} fill="#fcea2b" />
    <circle cx={49.751} cy={27.157} r={1} fill="#1e50a0" />
    <circle cx={28.752} cy={22.259} r={1.5} fill="#fcea2b" />
    <circle cx={28.752} cy={22.759} r={1} fill="#1e50a0" />
    <circle cx={43.34} cy={22.259} r={1.5} fill="#fcea2b" />
    <circle cx={43.34} cy={22.759} r={1} fill="#1e50a0" />
    <g fill="none" stroke="#444" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
      <path d="M42.058 55.958s3.011 2.118 3.872 1.533c.76-.517 0-3.674 0-3.674s4.276 2.12 5.162 1.14c.797-.882-1.49-4.515-1.49-4.515s5.04-.413 5.46-1.787c.332-1.082-2.78-3.574-2.78-3.574s6.539-.935 6.454-2.68c-.075-1.529-5.857-1.786-5.857-1.786s6.344-1.665 6.353-3.475c.007-1.167-4.07-2.283-4.07-2.283s4.81-2.112 4.666-3.574C59.724 30.22 56 29.397 56 29.397s3.458-3.744 2.737-4.964c-.606-1.026-4.765 0-4.765 0s2.505-4.54 1.49-5.56c-1.233-1.235-6.459.696-6.459.696s1.326-4.27.005-5.063c-1.288-.774-5.162 3.077-5.162 3.077s1.224-3.467-.463-4.956c-1.582-1.396-4.426 1.489-4.426 1.489S37.159 10.344 36 10.344s-2.956 4.268-2.956 4.268-2.202-3.033-4.156-2.382c-1.489.496-.734 5.353-.734 5.353s-3.874-3.851-5.162-3.077c-1.32.793-.557 4.97-.557 4.97s-4.64-1.815-5.896-.602c-1.55 1.496 1.49 5.559 1.49 5.559s-4.16-1.026-4.766 0c-.72 1.22 2.737 4.963 2.737 4.963s-3.724.825-3.829 1.886c-.144 1.463 4.666 3.574 4.666 3.574s-4.077 1.117-4.07 2.284c.01 1.81 4.383 2.865 4.383 2.865s-4.377.695-3.887 2.396c1.032 3.581 6.453 2.68 6.453 2.68s-3.11 2.491-2.78 3.574c.42 1.373 5.46 1.787 5.46 1.787s-2.286 3.633-1.49 4.515c.887.98 5.163-1.14 5.163-1.14s-.76 3.157 0 3.673c.861.585 3.872-1.532 3.872-1.532" />
      <path d="M34.892 22.601a3.136 3.136 0 0 1 3.075 2.196c1.304 3.145-.204 10.255.348 13.615.43 2.607 4.276 7.02 4.283 9.663.011 4.83-3.533 7.925-6.598 7.883-4.215-.057-6.547-5.314-6.598-7.883-.065-3.294 3.4-7.173 4.283-9.663.837-2.361 1.576-9.016.768-9.992-.548-.662-5.05-1.098-5.05-1.098s3.184-4.72 5.49-4.72Z" />
      <path d="M33.044 54.957v5.635l-2.217.739M35.261 60.592h-2.217M38.956 55.081v5.511l-2.217.739M41.173 60.592h-2.217" />
    </g>
  </svg>
);

Peacock.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Memo = memo(Peacock);
export default Memo;