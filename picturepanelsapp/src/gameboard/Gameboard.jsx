import React, { useEffect, useRef, useState } from "react";
import AllLinks from "../common/AllLinks";
import { useBodyClass } from "../common/useBodyClass";
import SignalRContext from "../signalr/SignalRContext";
import { useSignalR } from "../signalr/useSignalR";
import { CreateSignalRConnection } from "../signalr/SignalRConnectionFactory";
import Panels from "./Panels";
import "./Gameboard.css";
import "animate.css";

export default function Gameboard() {
  useBodyClass("gameboard");
  const [gameState, setGameState] = useState({});
  const [connectionId, setConnectionId] = useState();
  const signalRContext = useRef();

  useEffect(() => {
    signalRContext.current = CreateSignalRConnection(
      "gameStateId=" + localStorage.getItem("gameStateId"),
      setConnectionId
    );
  }, []);

  useSignalR("GameState", (gameState) => {
    setGameState(gameState);
  });

  useEffect(() => {
    // fetch initial game state, set gameState
    setGameState({ revealedPanels: [] });
  }, [connectionId]);

  return (
    <SignalRContext.Provider value={signalRContext.current}>
      <AllLinks />
      <Panels revealedPanels={gameState.revealedPanels ?? []} />
    </SignalRContext.Provider>
  );
}
