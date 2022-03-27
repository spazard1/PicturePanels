import React, { useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import { usePlayers } from "../common/usePlayers";
import Panels from "./Panels";
import TeamInfos from "../teaminfos/TeamInfos";
import Players from "./Players";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";
import FadedBox from "./FadedBox";
import { getImageEntity } from "./getImageEntity";

import "./Gameboard.css";
import "animate.css";

export default function Gameboard() {
  useBodyClass("gameboard");

  const [gameStateIdDisplay, setGameStateIdDisplay] = useState(false);
  const [gameStateIdDisplayText, setGameStateIdDisplayText] = useState();
  const [uploadedByDisplay, setUploadedByDisplay] = useState(false);
  const [uploadedByDisplayText, setUploadedByDisplayText] = useState();
  const [gameStateId, setGameStateId] = useState();

  useSignalRConnection("gameStateId=" + gameStateId, gameStateId);

  const { gameState } = useGameState(gameStateId);
  const { players } = usePlayers(gameStateId);

  useEffect(() => {
    if (!gameStateId || !gameState) {
      return;
    }

    if (gameState.revealedPanels) {
      setGameStateIdDisplayText("Join the game!\u00A0\u00A0\u00A0picturepanels.net\u00A0\u00A0\u00A0" + gameState.gameStateId);
    } else {
      setGameStateIdDisplayText(gameState.gameStateId);
    }

    if (gameState.turnType !== "Welcome" && gameState.turnType !== "EndGame") {
      setGameStateIdDisplay(true);
    } else {
      setGameStateIdDisplay(false);
      setUploadedByDisplay(false);
    }
  }, [gameState, gameStateId]);

  useEffect(() => {
    if (!gameStateId || !gameState) {
      return;
    }

    getImageEntity(gameStateId, (imageEntity) => {
      if (!imageEntity) {
        return;
      }
      if (imageEntity.uploadedBy) {
        setUploadedByDisplay(true);
        setUploadedByDisplayText("Uploaded by: " + imageEntity.uploadedBy);
      } else {
        setUploadedByDisplay(false);
      }

      if (imageEntity.name) {
        //document.getElementById("answerTitleText").innerHTML = imageEntity.name;
        //animationPromise = animationPromise.then(() => animateCSS("#answerTitle", ["slow", "bounceInDown"], ["bounceOutUp", "hidden"], 2000));
      } else {
        //animateCSS("#answerTitle", ["bounceOutUp"], ["slow", "bounceInDown"]);
      }
    });
  }, [gameStateId, gameState]);

  useEffect(() => {
    setGameStateId("KDML");
  }, []);

  return (
    <>
      <TeamInfos gameState={gameState} />
      <Players players={players}></Players>
      <Panels
        gameStateId={gameStateId}
        players={players}
        roundNumber={gameState.roundNumber ?? 0}
        revealedPanels={gameState.revealedPanels ?? []}
        teamTurn={gameState.teamTurn ?? 1}
        turnType={gameState.turnType}
      />
      <FadedBox
        displayState={gameStateIdDisplay}
        className="gameStateIdFadedBox"
        entranceClassName=" animate__bounceInLeft"
        exitClassName=" animate__bounceOutLeft"
      >
        {gameStateIdDisplayText}
      </FadedBox>
      <FadedBox
        displayState={uploadedByDisplay}
        className="uploadedByFadedBox"
        entranceClassName=" animate__bounceInRight"
        exitClassName=" animate__bounceOutRight"
      >
        {uploadedByDisplayText}
      </FadedBox>
    </>
  );
}
