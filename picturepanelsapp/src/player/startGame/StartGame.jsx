import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import putStartGame from "./putStartGame";
import putCancelStartGame from "./putCancelStartGame";
import useTimeRemaining from "../../common/useTimeRemaining";

const StartGame = ({ gameStateId, playerId, turnTime, turnTimeRemaining }) => {
  const timeRemaining = useTimeRemaining(false, turnTime, turnTimeRemaining, 2);

  const startGameOnClick = () => {
    putStartGame(gameStateId, playerId, () => {});
  };

  const cancelStartGameOnClick = () => {
    putCancelStartGame(gameStateId, playerId, () => {});
  };

  return (
    <>
      <div className="teamButtons">
        {!turnTimeRemaining && (
          <Button variant="success" onClick={startGameOnClick}>
            Start the Game!
          </Button>
        )}
        {turnTimeRemaining && (
          <Button variant="secondary" onClick={cancelStartGameOnClick}>
            Cancel Game Start
          </Button>
        )}
      </div>
      {turnTimeRemaining && <div>Game starts in {Math.ceil(timeRemaining / 1000)}...</div>}
    </>
  );
};

export default StartGame;

StartGame.propTypes = {
  gameStateId: PropTypes.string,
  playerId: PropTypes.string,
  turnTime: PropTypes.number,
  turnTimeRemaining: PropTypes.number,
};
