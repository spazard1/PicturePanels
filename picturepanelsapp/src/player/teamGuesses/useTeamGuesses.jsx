import { useEffect, useRef, useState } from "react";
import { useSignalR } from "../../signalr/useSignalR";
import getTeamGuesses from "./getTeamGuesses";

export function useTeamGuesses(gameStateId, playerId, teamNumber) {
  const [teamGuesses, setTeamGuesses] = useState([]);
  const [currentTeamGuess, setCurrentTeamGuess] = useState();
  const [passVoteCount, setPassVoteCount] = useState([]);
  const [teamGuessesLoading, setTeamGuessesLoading] = useState(true);
  const teamGuessesRef = useRef();
  teamGuessesRef.current = teamGuesses;

  const connectionId = useSignalR("AddTeamGuess", (teamGuess) => {
    setTeamGuesses([...teamGuessesRef.current, teamGuess]);
  });

  useSignalR("DeleteTeamGuess", (teamGuess) => {
    const newTeamGuesses = teamGuessesRef.current.filter((t) => t.ticks !== teamGuess.ticks);
    setTeamGuesses(newTeamGuesses);
  });

  useSignalR("VoteTeamGuess", (oldVote, newVote, votingPlayerId) => {
    if (votingPlayerId === playerId) {
      return;
    }

    updateTeamGuessVoteCounts(oldVote, newVote);
  });

  const updateTeamGuessVoteCounts = (oldVote, newVote) => {
    const newTeamGuesses = [...teamGuessesRef.current];

    newTeamGuesses.forEach((tg) => {
      if (tg.ticks === oldVote) {
        tg.voteCount = Math.max(0, tg.voteCount - 1);
      } else if (tg.ticks === newVote) {
        tg.voteCount++;
      }
    });

    if (oldVote === "Pass") {
      setPassVoteCount((pvc) => Math.max(0, pvc - 1));
    }
    if (newVote === "Pass") {
      setPassVoteCount((pvc) => pvc + 1);
    }

    setTeamGuesses(newTeamGuesses);
  };

  useEffect(() => {
    let highestVoteCount = 0;
    let highestTeamGuess;

    teamGuesses.forEach((tg) => {
      if (tg.voteCount > highestVoteCount) {
        highestVoteCount = tg.voteCount;
        highestTeamGuess = tg;
      }
    });
    if (passVoteCount >= highestVoteCount) {
      setCurrentTeamGuess(false);
      return;
    }
    setCurrentTeamGuess(highestTeamGuess.guess);
  }, [teamGuesses, passVoteCount]);

  useEffect(() => {
    if (!gameStateId || !playerId || !connectionId) {
      return;
    }

    setTeamGuessesLoading(true);
    getTeamGuesses(gameStateId, playerId, (tg) => {
      setTeamGuessesLoading(false);
      if (!tg) {
        return;
      }

      setTeamGuesses(tg.teamGuesses);
      setPassVoteCount(tg.passVoteCount);
    });
  }, [gameStateId, playerId, teamNumber, connectionId]);

  return { teamGuesses, passVoteCount, currentTeamGuess, teamGuessesLoading, updateTeamGuessVoteCounts };
}
