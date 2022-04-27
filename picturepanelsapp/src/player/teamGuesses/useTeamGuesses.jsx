import { useEffect, useState } from "react";
import { useSignalR } from "../signalr/useSignalR";
import getTeamGuesses from "./getTeamGuesses";

export function useTeamGuesses(gameStateId, player) {
  const [teamGuesses, setTeamGuesses] = useState([]);

  const connectionId = useSignalR("AddTeamGuess", (teamGuess) => {
    setTeamGuesses([...teamGuesses, teamGuess]);
  });

  useSignalR("DeleteTeamGuess", (teamGuess) => {
    const newTeamGuesses = teamGuesses.filter((t) => t.ticks !== teamGuess.ticks);
    setTeamGuesses(newTeamGuesses);
  });

  useSignalR("VoteTeamGuess", (oldVote, newVote) => {
    const newTeamGuesses = [...teamGuesses];
    newTeamGuesses.forEach((tg) => {
      if (tg.ticks === oldVote) {
        tg.voteCount = Math.max(0, tg.voteCount - 1);
      } else if (tg.ticks === newVote) {
        tg.voteCount++;
      }
    });
  });

  useEffect(() => {
    if (!gameStateId || !player || !connectionId) {
      return;
    }

    getTeamGuesses(gameStateId, player.playerId, (tg) => {
      if (!tg) {
        return;
      }

      setTeamGuesses(tg);
    });
  }, [gameStateId, player, connectionId]);

  return { teamGuesses };
}
