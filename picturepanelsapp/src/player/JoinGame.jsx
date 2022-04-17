import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";

import "./JoinGame.css";

const JoinGame = ({ gameStateId, onJoinGame }) => {
  const [color, setColor] = useState();

  const onColorChange = useCallback((c) => {
    setColor(c);
  }, []);

  return (
    <>
      <div className="center flexColumns">
        <div className="center hidden">Welcome to Picture Panels! {gameStateId}</div>

        <div className="center hidden">
          <input style={{ color: color }} className="playerTextInput" type="text" maxLength="14" autoComplete="off" placeholder="your name" />

          <input
            style={{ color: color }}
            className="playerTextInput gameStateId uppercase"
            type="text"
            maxLength="4"
            autoComplete="off"
            placeholder="game code"
          />
        </div>

        <ColorPicker onColorChange={onColorChange}></ColorPicker>

        <div className="choosePlayerName center hidden">
          <input className="center" type="button" value="Play!" onClick={onJoinGame} />
        </div>

        <div className="playerHelp center hidden">
          Want to start a game?
          <br />
          Go to picturepanels.net/gameboard on a screen that all players can see.
          <br />
        </div>
      </div>
    </>
  );
};

export default JoinGame;

JoinGame.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  onJoinGame: PropTypes.func.isRequired,
};
