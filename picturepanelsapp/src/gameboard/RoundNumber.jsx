import React from "react";
import PropTypes from "prop-types";

import "./RoundNumber.css";

const RoundNumber = ({ roundNumber, finalRoundNumber }) => {
  return (
    <div className="roundNumberCorner center">
      <div>Round</div>
      <div>
        {roundNumber} of {finalRoundNumber}
      </div>
    </div>
  );
};

export default RoundNumber;

RoundNumber.propTypes = {
  roundNumber: PropTypes.number.isRequired,
  finalRoundNumber: PropTypes.number.isRequired,
};
