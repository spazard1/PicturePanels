import React, { useContext, useEffect, useState } from "react";
import AllLinks from "../common/AllLinks";
import { useBodyClass } from "../common/useBodyClass";
import { useSignalR } from "../signalr/useSignalR";
import { CreateSignalRConnection } from "../signalr/SignalRConnectionFactory";
import Panels from "./Panels";
import getGameState from "../common/getGameState";

import "./Gameboard.css";
import "animate.css";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";

export default function Gameboard() {
  useBodyClass("gameboard");

  const [gameStateId, setGameStateId] = useState();
  const [gameState, setGameState] = useState({});
  const [loaded, setLoaded] = useState(false);

  const { setConnection, setConnectionId } = useContext(
    SignalRConnectionContext
  );

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    const newConnection = CreateSignalRConnection(
      "gameStateId=" + gameStateId,
      setConnectionId
    );

    console.log("setting connection", newConnection);
    setConnection(newConnection);
    setConnectionId(newConnection.id);
  }, [gameStateId]);

  useSignalR("GameState", (gameState) => {
    console.log("new gameState: " + gameState);
    setGameState(gameState);
  });

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    getGameState(gameStateId, (gameState) => {
      setGameState(gameState);
      setLoaded(false);
    });
  }, [gameStateId]);

  useEffect(() => {
    setGameStateId("KDML");
  }, []);

  useEffect(() => {
    if (!loaded || !gameState) {
      return;
    }

    setInterval(() => {
      setGameState((previousGameState) => {
        console.log(previousGameState.revealedPanels);

        let revealedPanels = previousGameState.revealedPanels;

        if (previousGameState.revealedPanels.length > 10) {
          revealedPanels = [];
        } else {
          revealedPanels.push(Math.ceil(Math.random() * 20) + "");
        }

        let newGameState = Object.assign({}, previousGameState);
        newGameState.revealedPanels = revealedPanels;
        return newGameState;
      });
    }, 5000);
  }, []);

  return (
    <>
      <AllLinks />
      <Panels
        roundNumber={gameState.roundNumber ?? 0}
        revealedPanels={gameState.revealedPanels ?? []}
      />
    </>
  );
}
