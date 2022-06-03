import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

import "./JoinGame.css";

const JoinGame = ({ isLoadingGame, onJoinGame, onCancel }) => {
  const [gameStateId, setGameStateId] = useState(localStorage.getItem("gameStateId"));

  const joinGameOnClick = () => {
    onJoinGame(gameStateId);
  };

  return (
    <>
      <div className="joinGameText">What is the game code?</div>
      <input className="joinGameStateIdInput uppercase" maxLength="4" value={gameStateId} onChange={(e) => setGameStateId(e.target.value)} />

      <div className="joinGameButtons center">
        <Button variant="light" className="createGameButton" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" disabled={isLoadingGame} className="createGameButton" onClick={joinGameOnClick}>
          {isLoadingGame ? "Joining..." : "Join Game"}
        </Button>
      </div>
    </>
  );
};

export default JoinGame;

JoinGame.propTypes = {
  isLoadingGame: PropTypes.bool,
  onJoinGame: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
