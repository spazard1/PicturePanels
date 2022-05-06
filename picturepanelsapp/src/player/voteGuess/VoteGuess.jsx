import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import getTeamGuesses from "./getTeamGuesses";

import "./VoteGuess.css";

const VoteGuess = ({ gameStateId, playerId }) => {
  const [teamGuesses, setTeamGuesses] = useState([]);

  const voteGuessOnClick = useCallback((teamGuessId) => {
    console.log(teamGuessId);
  }, []);

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
        <div key={teamGuess.teamGuessId} className="teamGuess" onClick={() => voteGuessOnClick(teamGuess.teamGuessId)}>
          {teamGuess.confidence}: {teamGuess.guess}
        </div>
      ))}
      <div className="teamGuess teamGuessPass" onClick={() => voteGuessOnClick("Pass")}>
        Pass
      </div>
    </>
  );
};

export default VoteGuess;

VoteGuess.propTypes = {
  gameStateId: PropTypes.string,
  playerId: PropTypes.string,
};
