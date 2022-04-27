import React from "react";
import PropTypes from "prop-types";

import "./TeamGuesses.css";

const TeamGuesses = ({ gameStateId }) => {
  return (
    <div className="center">
      <div className="teamGuessesContainer teamGuesses">
        <div className="teamGuessText">
          <div className="teamGuessVoteCount">0</div>
          testing {gameStateId}
          <div className="teamGuessDeleteButton">
            <img src="img/x-mark.png" />
          </div>
        </div>
        <div className="teamGuessText">
          <div className="teamGuessVoteCount teamGuessVoteCountChosen animate__animated">1</div>
          another
          <div className="teamGuessDeleteButton">
            <img src="img/x-mark.png" />
          </div>
        </div>
      </div>
      <div className="teamGuesses">
        <div className="teamGuessText teamGuess_Pass">
          <div className="teamGuessVoteCount">0</div>
          Pass
        </div>
        <div className="teamGuessText teamGuessAdd">Add Guess</div>
      </div>
    </div>
  );
};

export default TeamGuesses;

TeamGuesses.propTypes = {
  gameStateId: PropTypes.string.isRequired,
};
