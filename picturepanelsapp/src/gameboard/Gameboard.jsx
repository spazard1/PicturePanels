import React, { useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import { usePlayers } from "../common/usePlayers";
import Panels from "./Panels";
import TeamInfos from "../teaminfos/TeamInfos";
import Players from "./Players";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../signalr/useSignalRConnection";

import "./Gameboard.css";
import "animate.css";

export default function Gameboard() {
  useBodyClass("gameboard");

  const [gameStateId, setGameStateId] = useState();

  useSignalRConnection("gameStateId=" + gameStateId, gameStateId);

  const { gameState } = useGameState(gameStateId);
  const { players } = usePlayers(gameStateId);

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
    </>
  );
}
