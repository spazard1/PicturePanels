import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";

import "./JoinGame.css";

const JoinGame = ({ isLoading, onJoinGame, cachedGameStateId }) => {
  const [formValues, setFormValues] = useState({
    playerName: localStorage.getItem("playerName") ?? "",
    gameStateId: cachedGameStateId ?? "",
  });

  useEffect(() => {
    setFormValues((fv) => {
      return { ...fv, gameStateId: cachedGameStateId ?? "" };
    });
  }, [cachedGameStateId]);

  const onInputChange = useCallback(
    (event) => {
      setFormValues({ ...formValues, [event.target.name]: event.target.value });
    },
    [formValues]
  );

  const joinGameOnClick = () => {
    onJoinGame({
      ...formValues,
    });
  };

  return (
    <>
      <div className="welcomePlayerMessage">Welcome to Picture Panels!</div>

      <div className="playerTextInputContainer">
        <input
          name="playerName"
          className="playerTextInput"
          value={formValues.playerName}
          type="text"
          maxLength="12"
          autoComplete="off"
          placeholder="your name"
          onChange={onInputChange}
        />

        <input
          name="gameStateId"
          className="playerTextInput gameStateIdInput uppercase"
          value={formValues.gameStateId}
          type="text"
          maxLength="4"
          autoComplete="off"
          placeholder="game code"
          onChange={onInputChange}
        />
      </div>

      <div>
        <Button className="joinGameButton" variant="primary" size="lg" disabled={isLoading} onClick={joinGameOnClick}>
          {isLoading ? "Joining..." : "Join Game"}
        </Button>
      </div>

      <div className="startGameHelp">
        Want to start a game?
        <br />
        Go to picturepanels.net/gameboard on a screen that all players can see.
        <br />
      </div>
    </>
  );
};

export default JoinGame;

JoinGame.propTypes = {
  isLoading: PropTypes.bool,
  onJoinGame: PropTypes.func.isRequired,
  cachedGameStateId: PropTypes.string,
};
