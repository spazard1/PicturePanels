import React, { useEffect, useState } from "react";
import { useBodyClass } from "../common/useBodyClass";
import { usePlayers } from "../common/usePlayers";
import Panels from "./Panels";
import TeamInfos from "../teaminfos/TeamInfos";
import { useSelectedPanels } from "../common/useSelectedPanels";
import { useGameState } from "../common/useGameState";
import { useSignalRConnection } from "../common/useSignalRConnection";

import "./Gameboard.css";
import "animate.css";

export default function Gameboard() {
  useBodyClass("gameboard");

  const [gameStateId, setGameStateId] = useState();

  useSignalRConnection("gameStateId=" + gameStateId, gameStateId);

  const { gameState } = useGameState(gameStateId);
  const { players, setPlayers } = usePlayers(gameStateId);
  useSelectedPanels(players, setPlayers);

  useEffect(() => {
    setGameStateId("KDML");
  }, []);

  return (
    <>
      <TeamInfos gameState={gameState} />
      <Panels
        gameStateId={gameStateId}
        players={players}
        roundNumber={gameState.roundNumber ?? 0}
        revealedPanels={gameState.revealedPanels ?? []}
        turnType={gameState.turnType}
      />
    </>
  );
}
