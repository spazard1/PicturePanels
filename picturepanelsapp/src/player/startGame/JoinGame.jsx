import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import Button from "react-bootstrap/Button";

import "./JoinGame.css";

const JoinGame = ({ color, isLoading, onJoinGame, onColorChange, cachedGameStateId }) => {
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
    <div className="center flexColumns">
      <div className="center welcomePlayerMessage">Welcome to Picture Panels!</div>

      <div className="center">
        <input
          name="playerName"
          style={{ color: color }}
          className="playerTextInput"
          value={formValues.playerName}
          type="text"
          maxLength="14"
          autoComplete="off"
          placeholder="your name"
          onChange={onInputChange}
        />

        <input
          name="gameStateId"
          style={{ color: color }}
          className="playerTextInput gameStateIdInput uppercase"
          value={formValues.gameStateId}
          type="text"
          maxLength="4"
          autoComplete="off"
          placeholder="game code"
          onChange={onInputChange}
        />
      </div>

      <ColorPicker onColorChange={onColorChange}></ColorPicker>

      <div>
        <Button className="joinGameButton" variant="primary" size="lg" disabled={isLoading} onClick={joinGameOnClick}>
          {isLoading ? "Joining..." : "Join Game"}
        </Button>
      </div>

      <div className="startGameHelp center">
        Want to start a game?
        <br />
        Go to picturepanels.net/gameboard on a screen that all players can see.
        <br />
      </div>
    </div>
  );
};

export default JoinGame;

JoinGame.propTypes = {
  color: PropTypes.string,
  isLoading: PropTypes.bool,
  onJoinGame: PropTypes.func.isRequired,
  onColorChange: PropTypes.func.isRequired,
  cachedGameStateId: PropTypes.string,
};
