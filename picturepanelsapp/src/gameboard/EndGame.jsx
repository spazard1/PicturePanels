import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import getGameRounds from "../common/getGameRounds";
import EndGameRound from "./EndGameRound";

import "./EndGame.css";

const EndGame = ({ gameStateId }) => {
  const [gameRounds, setGameRounds] = useState([]);

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    getGameRounds(gameStateId, (grs) => {
      setGameRounds(grs);
    });
  }, [gameStateId]);

  return (
    <div className="endGameContainer center">
      <div className="endGameWinner">Placeholder winner!</div>
      <div className="endGameRounds">
        {gameRounds.map((gr) => (
          <EndGameRound key={gr.roundNumber} gameStateId={gameStateId} gameRound={gr}></EndGameRound>
        ))}
      </div>
    </div>
  );
};

export default EndGame;

EndGame.propTypes = {
  gameStateId: PropTypes.string.isRequired,
};
