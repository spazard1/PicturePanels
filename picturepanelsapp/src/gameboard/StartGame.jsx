import React from "react";
import JoinGame from "./JoinGame";
import CreateGame from "./CreateGame";
import PropTypes from "prop-types";

import "./StartGame.css";

const StartGame = ({ startGameState, onStartGameStateChange, onCreateGame, onJoinGame, onCancel }) => {
  return (
    <div className="startGameContainer">
      {startGameState === "" && (
        <div className="startGameText startGame">
          Welcome to Picture Panels!
          <br />
          <div
            className="center defaultButton startGameButton"
            onClick={() => {
              onStartGameStateChange("Create");
            }}
          >
            Create New Game
          </div>
          <div
            className="center defaultButton startGameButton"
            onClick={() => {
              onStartGameStateChange("Join");
            }}
          >
            Join Existing Game
          </div>
          <div className="loginContainer center">
            <div className="center defaultButton startGameButton">Login</div>
            <div className="center loginMessage">When you are logged in, you will not see images that you have already played.</div>
            <a href="newuser">Create a new user</a>
          </div>
          <div className="loggedInUser center">
            Logged in as: <span className="loggedInUserDisplayName"></span>
            <br />
            <input type="button" value="Logout" className="loggedInUserButton" />
          </div>
        </div>
      )}
      {startGameState === "Join" && <JoinGame onCancel={onCancel} onJoinGame={onJoinGame}></JoinGame>}
      {startGameState === "Create" && <CreateGame onCancel={onCancel} onCreateGame={onCreateGame}></CreateGame>}
    </div>
  );
};

export default StartGame;

StartGame.propTypes = {
  startGameState: PropTypes.string.isRequired,
  onStartGameStateChange: PropTypes.func.isRequired,
  onCreateGame: PropTypes.func.isRequired,
  onJoinGame: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
