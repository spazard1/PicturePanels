import React from "react";
import WelcomeJoinGame from "./WelcomeJoinGame";
import PropTypes from "prop-types";

import "./Welcome.css";

import WelcomeCreateGame from "./WelcomeCreateGame";

const Welcome = ({ welcomeState, onWelcomeStateChange, onCreateGame, onJoinGame, onCancel }) => {
  return (
    <div className="welcomeContainer">
      {welcomeState === "" && (
        <div className="welcomeText welcomeStartGame">
          Welcome to Picture Panels!
          <br />
          <div
            className="center defaultButton welcomeButton"
            onClick={() => {
              onWelcomeStateChange("Create");
            }}
          >
            Create New Game
          </div>
          <div
            className="center defaultButton welcomeButton"
            onClick={() => {
              onWelcomeStateChange("Join");
            }}
          >
            Join Existing Game
          </div>
          <div className="loginContainer center">
            <div className="center defaultButton welcomeButton">Login</div>
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
      {welcomeState === "Join" && <WelcomeJoinGame onCancel={onCancel} onJoinGame={onJoinGame}></WelcomeJoinGame>}
      {welcomeState === "Create" && <WelcomeCreateGame onCancel={onCancel} onCreateGame={onCreateGame}></WelcomeCreateGame>}
    </div>
  );
};

export default Welcome;

Welcome.propTypes = {
  welcomeState: PropTypes.string.isRequired,
  onWelcomeStateChange: PropTypes.func.isRequired,
  onCreateGame: PropTypes.func.isRequired,
  onJoinGame: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
