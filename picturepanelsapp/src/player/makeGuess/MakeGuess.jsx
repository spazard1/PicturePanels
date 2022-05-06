import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import putGuess from "./putGuess";

import "./MakeGuess.css";

const MakeGuess = ({ gameStateId, playerId, onSaveGuess }) => {
  const [guess, setGuess] = useState("");
  const [guessSubmit, setGuessSubmit] = useState(false);

  const onInputChange = useCallback((event) => {
    setGuess(event.target.value);
  }, []);

  const guessOnClick = () => {
    setGuessSubmit(true);
  };

  const sendGuessOnClick = (confidence) => {
    putGuess(gameStateId, playerId, guess, confidence, (result) => {
      if (result) {
        onSaveGuess();
      }
    });
  };

  const passOnClick = () => {
    putGuess(gameStateId, playerId, "Pass", (result) => {
      if (result) {
        onSaveGuess();
      }
    });
  };

  return (
    <>
      {!guessSubmit && (
        <>
          <div className="playerLabel makeGuessLabel">Enter a guess for your team, or pass.</div>
          <div>
            <input
              name="guess"
              className="guess"
              value={guess}
              type="text"
              autoComplete="off"
              placeholder="enter your guess..."
              onChange={onInputChange}
            />
          </div>
          <div className="makeGuessButtonContainer">
            <Button className="makeGuessButton" variant="secondary" onClick={passOnClick}>
              Pass
            </Button>
            <Button className="makeGuessButton" disabled={!guess} onClick={guessOnClick}>
              Guess
            </Button>
          </div>
          <div className="playerLabel previousGuessesLabel">Use one of your previous guesses again:</div>
        </>
      )}

      {guessSubmit && (
        <>
          <div className="playerLabel confidenceLabel">How confident are you in your guess &quot;{guess}&quot;?</div>
          <div>
            <Button className="confidenceButton" variant="success" onClick={() => sendGuessOnClick(100)}>
              100% Sure
            </Button>
          </div>
          <div>
            <Button className="confidenceButton" variant="primary" onClick={() => sendGuessOnClick(75)}>
              A Good Amount
            </Button>
          </div>
          <div>
            <Button className="confidenceButton" variant="info" onClick={() => sendGuessOnClick(50)}>
              About 50/50
            </Button>
          </div>
          <div>
            <Button className="confidenceButton" variant="warning" onClick={() => sendGuessOnClick(25)}>
              Only a little
            </Button>
          </div>
          <div>
            <Button className="confidenceButton confidenceButtonCancel" variant="secondary" onClick={() => setGuessSubmit(false)}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default MakeGuess;

MakeGuess.propTypes = {
  gameStateId: PropTypes.string,
  playerId: PropTypes.string,
  onSaveGuess: PropTypes.func,
};
