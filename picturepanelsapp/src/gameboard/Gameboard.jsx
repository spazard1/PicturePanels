import React, { useContext, useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import { useSignalR } from "../signalr/useSignalR";
import { CreateSignalRConnection } from "../signalr/SignalRConnectionFactory";
import Panels from "./Panels";
import getGameState from "../common/getGameState";
import "./Gameboard.css";
import "animate.css";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";
import TeamInfos from "../teaminfos/TeamInfos";

export default function Gameboard() {
  useBodyClass("gameboard");

  const [gameStateId, setGameStateId] = useState();
  const [gameState, setGameState] = useState({});

  const { setConnection, setConnectionId } = useContext(SignalRConnectionContext);

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    const newConnection = CreateSignalRConnection("gameStateId=" + gameStateId, setConnectionId);

    setConnection(newConnection);
    setConnectionId(newConnection.id);
  }, [gameStateId]);

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
  }, [gameStateId]);

  useEffect(() => {
    setGameStateId("KDML");
  }, []);

  return (
    <>
      <TeamInfos gameState={gameState} />
      <Panels roundNumber={gameState.roundNumber ?? 0} revealedPanels={gameState.revealedPanels ?? []} />
    </>
  );
}
