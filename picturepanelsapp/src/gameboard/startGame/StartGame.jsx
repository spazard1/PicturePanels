import React, { useCallback, useContext, useState } from "react";
import JoinGame from "./JoinGame";
import CreateGame from "./CreateGame";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import ModalMessage from "../../common/modal/ModalMessage";
import UserContext from "../../user/UserContext";
import getGameState from "../../common/getGameState";
import postGameState from "./postGameState";
import GameboardUserLogin from "./GameboardUserLogin";

import "./StartGame.css";

const StartGame = ({ onStartGame }) => {
  const { user } = useContext(UserContext);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [startGameState, setStartGameState] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const onModalMessageClose = () => {
    setModalMessage("");
  };

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
        if (gs.missingTags?.length > 0) {
          setModalMessage("Could not create the game. The tag(s) '" + gs.missingTags.join(", ") + "' were not found.");
          return;
        }
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

  return (
    <>
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
          </>
        )}
        <GameboardUserLogin />
        {startGameState === "Join" && <JoinGame isLoadingGame={isLoadingGame} onCancel={onCancel} onJoinGame={onJoinGame} />}
        {startGameState === "Create" && <CreateGame isLoadingGame={isLoadingGame} onCancel={onCancel} onCreateGame={onCreateGame} />}
      </div>
    </>
  );
};

StartGame.propTypes = {
  onStartGame: PropTypes.func.isRequired,
};

export default StartGame;
