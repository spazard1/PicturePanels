import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import putStartGame from "./putStartGame";
import putCancelStartGame from "./putCancelStartGame";
import useTimeRemaining from "../../common/useTimeRemaining";

import "./StartGame.css";

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
      <div className="startGameButtonsContainer">
        {!turnTimeRemaining && (
          <Button className="startGameButton" variant="success" onClick={startGameOnClick}>
            Start the Game!
          </Button>
        )}
        {turnTimeRemaining && (
          <Button className="startGameButton" variant="secondary" onClick={cancelStartGameOnClick}>
            Cancel Game Start
          </Button>
        )}
      </div>
      <div className="startGameTime">
        {timeRemaining.millisecondsRemaining && <div>Game starts in {Math.ceil(timeRemaining.millisecondsRemaining / 1000)}...</div>}
      </div>
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
