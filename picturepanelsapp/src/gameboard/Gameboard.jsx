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
    });
  }, [gameStateId, connectionId]);

  useEffect(() => {
    setGameStateId("KDML");
  }, []);

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
