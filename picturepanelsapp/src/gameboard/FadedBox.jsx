import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./FadedBox.css";

export default function FadedBox({ children, displayState, className, entranceClassName, exitClassName }) {
  return (
    <>
      {children && (
        <div
          className={classNames("fadedBox", "animate__animated", "animate__slow", className, {
            [`${entranceClassName}`]: displayState,
            [`${exitClassName}`]: !displayState,
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
  entranceClassName: PropTypes.string,
  exitClassName: PropTypes.string,
  autoExit: PropTypes.number,
};
