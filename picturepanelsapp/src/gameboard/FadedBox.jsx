import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./FadedBox.css";

export default function FadedBox({ children, displayState, className, entranceClassNames, exitClassNames }) {
  return (
    <>
      {children && (
        <div
          className={classNames("fadedBox", "animate__animated", className, {
            [`${entranceClassNames}`]: displayState,
            [`${exitClassNames}`]: !displayState,
          })}
        >
          <div className="fadedBoxTitle">{children}</div>
        </div>
      )}
    </>
  );
}

FadedBox.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  displayState: PropTypes.bool.isRequired,
  className: PropTypes.string.isRequired,
  entranceClassNames: PropTypes.string,
  exitClassNames: PropTypes.string,
  autoExit: PropTypes.number,
};
