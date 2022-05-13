import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Form } from "react-bootstrap";
import putGuess from "./putGuess";

import "./MakeGuess.css";

const MakeGuess = ({ gameStateId, playerId, onSaveGuess }) => {
  const [guess, setGuess] = useState("");
  const [confidence, setConfidence] = useState(50);
  const [confidenceMessage, setConfidenceMessage] = useState("");
  const [guessSubmit, setGuessSubmit] = useState(false);

  const onInputChange = useCallback((event) => {
    setGuess(event.target.value);
  }, []);

  const guessOnClick = () => {
    setGuessSubmit(true);
  };

  const sendGuessOnClick = () => {
    putGuess(gameStateId, playerId, guess, confidence, (result) => {
      if (result) {
        onSaveGuess();
      }
    });
  };

  const passOnClick = () => {
    putGuess(gameStateId, playerId, "Pass", -1, (result) => {
      if (result) {
        onSaveGuess();
      }
    });
  };

  useEffect(() => {
    if (confidence >= 100) {
      setConfidenceMessage("I'm 100% Sure");
    } else if (confidence >= 85) {
      setConfidenceMessage("I'm Mostly Confident");
    } else if (confidence >= 70) {
      setConfidenceMessage("It's a Good Guess");
    } else if (confidence >= 56) {
      setConfidenceMessage("I'm More Sure Than Not");
    } else if (confidence >= 44) {
      setConfidenceMessage("I'm About 50/50");
    } else if (confidence >= 20) {
      setConfidenceMessage("I'm Not Confident");
    } else {
      setConfidenceMessage("It's a Wild Guess");
    }
  }, [confidence]);

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
          <div className="playerLabel confidenceRangeLabel">
            <span>←Not Confident</span>
            <span>Very Confident→</span>
          </div>
          <Form.Range className="confidenceRange" min={1} max={100} value={confidence} onChange={(e) => setConfidence(e.target.value)}></Form.Range>
          <div className="confidenceMessageLabel">{confidenceMessage}</div>
          <div className="confidenceButtonsContainer">
            <Button className="confidenceButton confidenceButtonCancel" variant="secondary" onClick={() => setGuessSubmit(false)}>
              Cancel
            </Button>
            <Button className="confidenceButton" variant="success" onClick={() => sendGuessOnClick()}>
              Send Guess
            </Button>
          </div>
          {/*
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
          */}
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
