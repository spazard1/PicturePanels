import React, { useCallback, useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import Chat from "./Chat";
import PanelButtons from "./PanelButtons";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import "./Player.css";
import { useErrorMessageModal } from "../common/useErrorMessageModal";
import TeamGuesses from "./TeamGuesses";

export default function Player() {
  useBodyClass("player");

  const [gameStateId, setGameStateId] = useState();
  const { ErrorMessageModal, setErrorMessage } = useErrorMessageModal();

  const { queryString, setQueryString } = useSignalRConnection();

  const { gameState } = useGameState(gameStateId, onGameStateLoadError);

  const onJoinGame = (gameStateId) => {
    setGameStateId(gameStateId);
  };

  useEffect(() => {
    if (!gameState || !gameStateId) {
      return;
    }

    if (!queryString) {
      setQueryString("gameStateId=" + gameStateId);
    }
  }, [gameStateId, gameState, queryString, setQueryString]);

  const onGameStateLoadError = useCallback(() => {
    setGameStateId("");
    setErrorMessage("Did not find a game with that code. Check the game code and try again.");
  }, [setErrorMessage]);

  return (
    <>
      <ErrorMessageModal></ErrorMessageModal>
      <div id="mainDiv" className="center flexColumns">
        <div id="choosePlayerNameLabel" className="center hidden">
          Welcome to Picture Panels!
        </div>

        <div id="playerNameInputDiv" className="center hidden">
          <input id="playerNameInput" className="playerTextInput" type="text" maxLength="14" autoComplete="off" placeholder="your name" />

          <input
            id="gameStateId"
            className="playerTextInput gameStateId uppercase"
            type="text"
            maxLength="4"
            autoComplete="off"
            placeholder="game code"
          />
        </div>

        <div id="colorPicker" className="center hidden"></div>

        <div id="choosePlayerName" className="choosePlayerName center hidden">
          <input id="choosePlayerNameButton" className="center" type="button" value="Play!" onClick={onJoinGame} />
        </div>

        <div id="playerHelp" className="playerHelp center hidden">
          Want to start a game?
          <br />
          Go to picturepanels.net/gameboard on a screen that all players can see.
          <br />
        </div>

        <div id="chooseTeam" className="center hidden">
          Choose your team
        </div>

        <div id="playerBanner" className="playerBanner playerBannerChooseTeam center hidden">
          <div id="playerName" className="playerBannerItem playerName hidden"></div>
          <div id="playerBannerTeamNames" className="playerBannerItem">
            <div id="teamOneName" className="teamName chooseTeamName teamBox teamOneBox">
              Loading...
            </div>
            <div id="teamTwoName" className="teamName chooseTeamName teamBox teamTwoBox">
              Loading...
            </div>
            <div id="chooseSmallestTeam" className="teamName chooseTeamName chooseSmallestTeamBox">
              Choose for me
            </div>
          </div>
        </div>
        <div id="turnStatusMessage" className="turnStatusMessage center"></div>

        <PanelButtons></PanelButtons>

        <TeamGuesses></TeamGuesses>

        <div id="teamButtons" className="teamButtons hidden">
          <div id="startGameButton" className="defaultButton playerReadyButton hidden">
            Start the Game!
          </div>
          <div id="cancelStartGameButton" className="defaultButton playerReadyButton hidden">
            Cancel Start Game
          </div>

          <div id="playerReadyButton" className="defaultButton playerReadyButton hidden">
            We are ready!
          </div>
          <div id="teamGuessButton" className="defaultButton teamGuessButton hidden">
            Add a Guess
          </div>
        </div>

        <Chat></Chat>
      </div>
    </>
  );
}
