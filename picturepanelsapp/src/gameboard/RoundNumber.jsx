import React from "react";
import PropTypes from "prop-types";

import "./RoundNumber.css";

const RoundNumber = ({ roundNumber, finalRoundNumber }) => {
  return (
    <div className="roundNumberCorner center">
      Round
      <br />
      {roundNumber} of {finalRoundNumber}
    </div>
  );
};

export default RoundNumber;

RoundNumber.propTypes = {
  roundNumber: PropTypes.number.isRequired,
  finalRoundNumber: PropTypes.number.isRequired,
};
