import React from "react";
import PropTypes from "prop-types";

import "./LoadingRing.css";

const LoadingRing = ({ message }) => {
  return (
    <>
      <div>{message}</div>
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </>
  );
};

LoadingRing.propTypes = {
  message: PropTypes.string,
};

export default LoadingRing;
