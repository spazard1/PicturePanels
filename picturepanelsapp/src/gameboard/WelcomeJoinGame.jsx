import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const WelcomeJoinGame = ({ onJoinGame, onCancel }) => {
  const gameStateIdRef = useRef();

  const joinGameOnClick = () => {
    localStorage.setItem("gameStateId", gameStateIdRef.current.value.toUpperCase());
    onJoinGame(gameStateIdRef.current.value.toUpperCase());
  };

  useEffect(() => {
    gameStateIdRef.current.value = localStorage.getItem("gameStateId");
  });

  return (
    <>
      <div className="welcomeText welcomeExistingGame">
        What is the game code? <br />
        <input ref={gameStateIdRef} className="gameStateIdInput uppercase" maxLength="4" />
      </div>
      <div className="startGameButtons center">
        <div className="center defaultButton welcomeButton" onClick={onCancel}>
          Cancel
        </div>
        <div className="center defaultButton welcomeButton" onClick={joinGameOnClick}>
          Join Game
        </div>
      </div>
    </>
  );
};

export default WelcomeJoinGame;

WelcomeJoinGame.propTypes = {
  onJoinGame: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
