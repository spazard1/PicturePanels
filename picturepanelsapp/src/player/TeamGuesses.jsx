import React from "react";
import PropTypes from "prop-types";

import "./TeamGuesses.css";

const TeamGuesses = ({ gameStateId }) => {
  return (
    <div className="center">
      <div className="teamGuessesContainer teamGuesses"></div>
      <div className="teamGuesses">
        <div className="teamGuessText teamGuess_Pass">
          <div className="teamGuessVoteCount">0</div>
          Pass {gameStateId}
        </div>
        <div className="teamGuessText teamGuessAdd">Add Guess</div>
      </div>

      <div className="teamButtons">
        <div className="defaultButton playerReadyButton">We are ready!</div>
        <div className="defaultButton teamGuessButton">Confirm</div>
      </div>
    </div>
  );
};

export default TeamGuesses;

TeamGuesses.propTypes = {
  gameStateId: PropTypes.string.isRequired,
};
