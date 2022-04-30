import React, { useState } from "react";
import PropTypes from "prop-types";

const JoinGame = ({ onJoinGame, onCancel, cachedGameStateId }) => {
  const [gameStateId, setGameStateId] = useState(cachedGameStateId);

  const joinGameOnClick = () => {
    onJoinGame(gameStateId);
  };

  return (
    <>
      <div className="startGameText">
        What is the game code? <br />
        <input className="joinGameStateIdInput uppercase" maxLength="4" value={cachedGameStateId} onChange={(e) => setGameStateId(e.target.value)} />
      </div>
      <div className="startGameButtons center">
        <div className="center defaultButton startGameButton" onClick={onCancel}>
          Cancel
        </div>
        <div className="center defaultButton startGameButton" onClick={joinGameOnClick}>
          Join Game
        </div>
      </div>
    </>
  );
};

export default JoinGame;

JoinGame.propTypes = {
  onJoinGame: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  cachedGameStateId: PropTypes.string,
};
