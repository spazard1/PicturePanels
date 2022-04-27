import React from "react";
import PropTypes from "prop-types";

import "./TeamGuesses.css";
import xmark from "./x-mark.png";
import { useTeamGuesses } from "./useTeamGuesses";
import classNames from "classnames";

const TeamGuesses = ({ gameStateId, player }) => {
  const { teamGuesses, passVoteCount } = useTeamGuesses(gameStateId, player);

  return (
    <div className="center">
      <div className="teamGuessesContainer teamGuesses">
        {teamGuesses.map((teamGuess) => (
          <div key={teamGuess.ticks} className="teamGuessText">
            <div className={classNames("teamGuessVoteCount", { teamGuessVoteCountChosen: player.teamGuessVote === teamGuess.ticks })}>
              {teamGuess.voteCount}
            </div>
            {teamGuess.guess}
            <div className="teamGuessDeleteButton">
              <img src={xmark} />
            </div>
          </div>
        ))}
      </div>
      <div className="teamGuesses">
        <div className="teamGuessText teamGuess_Pass">
          <div className="teamGuessVoteCount">{passVoteCount}</div>
          Pass
        </div>
        <div className="teamGuessText teamGuessAdd">Add Guess</div>
      </div>
    </div>
  );
};

export default TeamGuesses;

TeamGuesses.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  player: PropTypes.object.isRequired,
};
