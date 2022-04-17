import React from "react";
import PropTypes from "prop-types";

const StartGameButtons = ({ turnEndTime }) => {
  return (
    <div className="teamButtons">
      {turnEndTime && <div className="defaultButton playerReadyButton">Start the Game!</div>}
      {!turnEndTime && <div className="defaultButton playerReadyButton">Cancel Start Game</div>}
    </div>
  );
};

export default StartGameButtons;

StartGameButtons.propTypes = {
  turnEndTime: PropTypes.string,
};
