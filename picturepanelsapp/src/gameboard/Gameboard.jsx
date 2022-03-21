import React, { useEffect, useState } from "react";
import AllLinks from "../common/AllLinks";
import { useBodyClass } from "../common/useBodyClass";
import SignalRContext from "../signalr/SignalRContext";
import { useSignalR } from "../signalr/useSignalR";
import { CreateSignalRConnection } from "../signalr/SignalRConnectionFactory";
import Panels from "./Panels";
import "./Gameboard.css";
import "animate.css";
import getGameState from "../common/getGameState";

export default function Gameboard() {
  useBodyClass("gameboard");

  const [gameStateId, setGameStateId] = useState();
  const [gameState, setGameState] = useState({});
  const [connection, setConnection] = useState();
  const [connectionId, setConnectionId] = useState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const newConnection = CreateSignalRConnection(
      "gameStateId=" + localStorage.getItem("gameStateId"),
      setConnectionId
    );

    setConnection(newConnection);
    setConnectionId(newConnection.id);
  }, []);

  useSignalR("GameState", (gameState) => {
    setGameState(gameState);
  });

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    getGameState(gameStateId, (gameState) => {
      setGameState(gameState);
      setLoaded(true);
    });
  }, [gameStateId, connectionId]);

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

        let newGameState = Object.assign({}, previousGameState); // creating copy of state variable jasper
        newGameState.revealedPanels = revealedPanels; // update the name property, assign a new value
        return newGameState;
      });
    }, 5000);
  }, [loaded]);

  return (
    <SignalRContext.Provider value={connection}>
      <AllLinks />
      <Panels
        roundNumber={gameState.roundNumber ?? 0}
        revealedPanels={gameState.revealedPanels ?? []}
      />
    </SignalRContext.Provider>
  );
}
