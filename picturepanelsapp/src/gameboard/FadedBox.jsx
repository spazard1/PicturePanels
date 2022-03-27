import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./FadedBox.css";

export default function FadedBox({ isDisplayed, displayText, className, entranceClassName, exitClassName }) {
  console.log(exitClassName);

  return (
    <div className={classNames("fadedBox", "animate__animated", "animate__slow", className, { [`${entranceClassName}`]: isDisplayed })}>
      <div className="fadedBoxTitle">{displayText}</div>
    </div>
  );
}

FadedBox.propTypes = {
  isDisplayed: PropTypes.bool.isRequired,
  displayText: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  entranceClassName: PropTypes.string,
  exitClassName: PropTypes.string,
  autoExit: PropTypes.number,
};
