import React, { useContext, useEffect, useState } from "react";
import JoinGame from "./JoinGame";
import CreateGame from "./CreateGame";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import ModalLogin from "../../common/modal/ModalLogin";
import ModalMessage from "../../common/modal/ModalMessage";
import getUser from "../../user/getUser";
import putLogin from "../../user/putLogin";
import UserContext from "../../user/UserContext";
import getGameState from "../../common/getGameState";
import postGameState from "./postGameState";

import "./StartGame.css";
import ModalNewUser from "../../common/modal/ModalNewUser";
import postUser from "../../user/postUser";
import { useCallback } from "react";

const StartGame = ({ onStartGame }) => {
  const { user, setUser } = useContext(UserContext);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [startGameState, setStartGameState] = useState("");
  const [showModalLogin, setShowModalLogin] = useState(false);
  const [showModalNewUser, setShowModalNewUser] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const onClickCreateGame = useCallback(() => {
    if (!user) {
      setModalMessage("Remember, if you login before you create a game, images you play will be saved so you don't see them again in future games.");
    }
    setStartGameState("Create");
  }, [user]);

  const onCreateGame = (gameOptions) => {
    setIsLoadingGame(true);

    postGameState(gameOptions, (gs) => {
      setIsLoadingGame(false);

      if (gs) {
        onStartGame(gs);
      } else {
        setModalMessage("There was a problem creating the game. Please try again later.");
      }
    });
  };

  const onJoinGame = (gameStateId) => {
    setIsLoadingGame(true);

    getGameState(gameStateId, (gs) => {
      setIsLoadingGame(false);

      if (gs) {
        onStartGame(gs);
      } else {
        setModalMessage("Did not find a game with that code. Check the game code and try again.");
      }
    });
  };

  const onCancel = () => {
    setStartGameState("");
  };

  const onModalLoginClose = () => {
    setShowModalLogin(false);
  };

  const onModalNewUserClose = () => {
    setShowModalNewUser(false);
  };

  const onModalMessageClose = () => {
    setModalMessage("");
  };

  const onLogout = () => {
    setUser();
    localStorage.removeItem("userToken");
  };

  const onNewUser = (userInfo) => {
    setShowModalNewUser(false);
    setIsCreatingUser(true);

    postUser(userInfo, (response) => {
      setIsCreatingUser(false);

      if (response === 409) {
        // conflict
        setModalMessage("That username already exists. Please choose another.");
        return;
      }

      if (!response) {
        setModalMessage("Failed to create user. Please try again later.");
        return;
      }

      setModalMessage("User is created. You can now login in.");
    });
  };

  const onLogin = (userInfo) => {
    setShowModalLogin(false);
    setIsLoadingLogin(true);

    localStorage.setItem("userName", userInfo.userName);

    putLogin(userInfo, (response) => {
      setIsLoadingLogin(false);

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
        setIsLoadingUser(false);

        if (!user) {
          localStorage.removeItem("userToken");
          return;
        }

        setUser(user);
      });
    } else {
      setIsLoadingUser(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ModalLogin showModal={showModalLogin} onLogin={onLogin} onModalClose={onModalLoginClose} />
      <ModalNewUser showModal={showModalNewUser} onNewUser={onNewUser} onModalClose={onModalNewUserClose} />
      <ModalMessage modalMessage={modalMessage} onModalClose={onModalMessageClose} />
      <div className="startGameContainer">
        {startGameState === "" && (
          <>
            <div className="startGameLabel startGame">Welcome to Picture Panels!</div>
            <div>
              <Button variant="light" className="startGameButton startGameCreateButton" onClick={onClickCreateGame}>
                Create Game
              </Button>
            </div>
            <div>
              <Button
                variant="light"
                className="startGameButton startGameJoinButton"
                onClick={() => {
                  setStartGameState("Join");
                }}
              >
                Join Game
              </Button>
            </div>

            {!isLoadingUser && (
              <div className="loginContainer center">
                {!user && (
                  <>
                    <div className="center loginMessage">When you are logged in, you will not see images that you have already played.</div>
                    <div className="startGameButtonsContainer">
                      <Button
                        variant="light"
                        className="startGameButton"
                        disabled={isLoadingLogin || isCreatingUser}
                        onClick={() => {
                          setShowModalNewUser(true);
                        }}
                      >
                        {isCreatingUser ? "Creating..." : "Create User"}
                      </Button>
                      <Button
                        variant="light"
                        className="startGameButton"
                        disabled={isLoadingLogin || isCreatingUser}
                        onClick={() => {
                          setShowModalLogin(true);
                        }}
                      >
                        {isLoadingLogin ? "Logging in..." : "Login"}
                      </Button>
                    </div>
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
            {isLoadingUser && <div>Loading...</div>}
          </>
        )}
        {startGameState === "Join" && <JoinGame isLoadingGame={isLoadingGame} onCancel={onCancel} onJoinGame={onJoinGame} />}
        {startGameState === "Create" && <CreateGame isLoadingGame={isLoadingGame} onCancel={onCancel} onCreateGame={onCreateGame} />}
      </div>
    </>
  );
};

export default StartGame;

StartGame.propTypes = {
  onStartGame: PropTypes.func.isRequired,
};