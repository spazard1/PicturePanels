import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";

import "./JoinGame.css";

const JoinGame = ({ color, onJoinGame, onColorChange }) => {
  const [formValues, setFormValues] = useState({
    playerName: "",
    gameStateId: "",
  });

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

      <div className="choosePlayerName center">
        <input className="joinGameButton center" type="button" value="Play!" onClick={joinGameOnClick} />
      </div>

      <div className="playerHelp center">
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
  onJoinGame: PropTypes.func.isRequired,
  onColorChange: PropTypes.func.isRequired,
};
