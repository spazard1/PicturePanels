import { useEffect, useRef, useState } from "react";
import { useSignalR } from "../../signalr/useSignalR";
import getTeamGuesses from "./getTeamGuesses";

export function useTeamGuesses(gameStateId, player) {
  const [teamGuesses, setTeamGuesses] = useState([]);
  const [passVoteCount, setPassVoteCount] = useState([]);
  const teamGuessesRef = useRef();
  teamGuessesRef.current = teamGuesses;

  const connectionId = useSignalR("AddTeamGuess", (teamGuess) => {
    setTeamGuesses([...teamGuessesRef.current, teamGuess]);
  });

  useSignalR("DeleteTeamGuess", (teamGuess) => {
    const newTeamGuesses = teamGuessesRef.current.filter((t) => t.ticks !== teamGuess.ticks);
    setTeamGuesses(newTeamGuesses);
  });

  useSignalR("VoteTeamGuess", (oldVote, newVote) => {
    const newTeamGuesses = [...teamGuessesRef.current];
    newTeamGuesses.forEach((tg) => {
      if (tg.ticks === oldVote) {
        tg.voteCount = Math.max(0, tg.voteCount - 1);
      } else if (tg.ticks === newVote) {
        tg.voteCount++;
      }

      if (oldVote === "Pass") {
        setPassVoteCount((pvc) => Math.max(0, pvc - 1));
      }
      if (newVote === "Pass") {
        setPassVoteCount((pvc) => pvc + 1);
      }
    });
    setTeamGuesses(newTeamGuesses);
  });

  useEffect(() => {
    if (!gameStateId || !player || !connectionId) {
      return;
    }

    getTeamGuesses(gameStateId, player.playerId, (tg) => {
      if (!tg) {
        return;
      }

      setTeamGuesses(tg.teamGuesses);
      setPassVoteCount(tg.passVoteCount);
    });
  }, [gameStateId, player, connectionId]);

  return { teamGuesses, passVoteCount };
}
