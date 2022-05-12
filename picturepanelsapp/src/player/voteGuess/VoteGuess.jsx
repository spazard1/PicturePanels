import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import getTeamGuesses from "./getTeamGuesses";

import "./VoteGuess.css";
import PlayerName from "../../common/PlayerName";
import { Button } from "react-bootstrap";
import putGuessVote from "./putGuessVote";

const VoteGuess = ({ gameStateId, playerId }) => {
  const [teamGuesses, setTeamGuesses] = useState([]);

  const voteGuessOnClick = useCallback(
    (teamGuessId) => {
      putGuessVote(gameStateId, playerId, teamGuessId, (result) => {
        console.log(result);
      });
    },
    [gameStateId, playerId]
  );

  useEffect(() => {
    if (!gameStateId || !playerId) {
      return;
    }

    getTeamGuesses(gameStateId, playerId, (tgs) => {
      setTeamGuesses(tgs);
    });
  }, [gameStateId, playerId]);

  return (
    <>
      <div className="playerLabel makeGuessLabel">Vote for a guess or pass.</div>
      {teamGuesses.map((teamGuess) => (
        <Button key={teamGuess.teamGuessId} className="teamGuess" onClick={() => voteGuessOnClick(teamGuess.teamGuessId)}>
          <div className="teamGuessConfidence">{teamGuess.confidence}%</div>
          <div className="teamGuessText">{teamGuess.guess}</div>
          <div className="teamGuessPlayers">
            {teamGuess.players.map((player) => (
              <PlayerName key={player.playerId} player={player}></PlayerName>
            ))}
          </div>
        </Button>
      ))}
      <Button className="teamGuessPass" variant="secondary" onClick={() => voteGuessOnClick("Pass")}>
        Pass
      </Button>
    </>
  );
};

export default VoteGuess;

VoteGuess.propTypes = {
  gameStateId: PropTypes.string,
  playerId: PropTypes.string,
};
