import React, { useContext, useEffect, useState } from "react";
import JoinGame from "./JoinGame";
import CreateGame from "./CreateGame";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import ModalLogin from "../common/modal/ModalLogin";
import ModalMessage from "../common/modal/ModalMessage";
import getUser from "../user/getUser";
import putLogin from "../user/putLogin";
import UserContext from "../user/UserContext";

import "./StartGame.css";

const StartGame = ({ startGameState, onStartGameStateChange, onCreateGame, onJoinGame, onCancel }) => {
  const { user, setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [showModalLogin, setShowModalLogin] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const onModalLoginClose = () => {
    setShowModalLogin(false);
  };

  const onModalMessageClose = () => {
    setShowModalLogin(false);
  };

  const onLogout = () => {
    setUser();
    localStorage.removeItem("userToken");
  };

  const onLogin = (userInfo) => {
    setShowModalLogin(false);

    putLogin(userInfo, (response) => {
      if (!response) {
        setModalMessage("Failed to login. Check your username/password and try again.");
        return;
      }

      setUser(response.user);
      localStorage.setItem("userToken", response.userToken);
    });
  };

  useEffect(() => {
    if (localStorage.getItem("userToken")) {
      getUser((user) => {
        setIsLoading(false);

        if (!user) {
          localStorage.removeItem("userToken");
          return;
        }

        setUser(user);
      });
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ModalLogin showModal={showModalLogin} onLogin={onLogin} onModalClose={onModalLoginClose} />
      <ModalMessage modalMessage={modalMessage} onModalClose={onModalMessageClose} />
      <div className="startGameContainer">
        {startGameState === "" && (
          <>
            <div className="startGameLabel startGame">Welcome to Picture Panels!</div>
            <div>
              <Button
                variant="light"
                className="startGameButton"
                onClick={() => {
                  onStartGameStateChange("Create");
                }}
              >
                Create New Game
              </Button>
            </div>
            <div>
              <Button
                variant="light"
                className="startGameButton"
                onClick={() => {
                  onStartGameStateChange("Join");
                }}
              >
                Join Existing Game
              </Button>
            </div>

            {!isLoading && (
              <div className="loginContainer center">
                {!user && (
                  <>
                    <div>
                      <Button
                        variant="light"
                        className="startGameButton"
                        onClick={() => {
                          setShowModalLogin(true);
                        }}
                      >
                        Login
                      </Button>
                    </div>
                    <div className="center loginMessage">When you are logged in, you will not see images that you have already played.</div>
                    <a href="newuser">Create a new user</a>
                  </>
                )}
                {user && (
                  <>
                    Logged in as: <span className="loggedInUserDisplayName">{user.displayName}</span>
                    <div>
                      <Button variant="light" className="startGameButton" onClick={onLogout}>
                        Logout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
        {startGameState === "Join" && <JoinGame onCancel={onCancel} onJoinGame={onJoinGame}></JoinGame>}
        {startGameState === "Create" && <CreateGame onCancel={onCancel} onCreateGame={onCreateGame}></CreateGame>}
      </div>
    </>
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
