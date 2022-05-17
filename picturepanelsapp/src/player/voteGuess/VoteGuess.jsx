import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import getTeamGuesses from "./getTeamGuesses";
import PlayerName from "../../common/PlayerName";
import { Button } from "react-bootstrap";
import putGuessVote from "./putGuessVote";
import putOk from "./putOk";
import { useSignalR } from "../../signalr/useSignalR";

import "./VoteGuess.css";

const VoteGuess = ({ isVisible, gameStateId, playerId, onVoteGuess }) => {
  const [teamGuesses, setTeamGuesses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const okOnClick = () => {
    putOk(gameStateId, playerId, (result) => {
      if (result) {
        onVoteGuess();
      }
    });
  };

  const voteGuessOnClick = (teamGuessId) => {
    putGuessVote(gameStateId, playerId, teamGuessId, (result) => {
      if (result) {
        onVoteGuess();
      }
    });
  };

  const connectionId = useSignalR("TeamGuesses", (teamGuesses) => {
    setTeamGuesses(teamGuesses);
    setIsLoaded(true);
  });

  useEffect(() => {
    if (!isVisible) {
      setIsLoaded(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!gameStateId || !playerId) {
      return;
    }

    getTeamGuesses(gameStateId, playerId, (tgs) => {
      setTeamGuesses(tgs);
      setIsLoaded(true);
    });
  }, [gameStateId, playerId, connectionId]);

  if (!isVisible) {
    return <></>;
  }

  return (
    <>
      {isLoaded && teamGuesses.length === 0 && (
        <>
          <div>No one from your team entered a guess. Wait for the other team to vote for their guess.</div>
          <Button className="teamGuessPass" variant="secondary" onClick={() => okOnClick("Pass")}>
            OK!
          </Button>
        </>
      )}
      {isLoaded && teamGuesses.length > 0 && (
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
      )}
    </>
  );
};

export default VoteGuess;

VoteGuess.propTypes = {
  isVisible: PropTypes.bool,
  gameStateId: PropTypes.string,
  playerId: PropTypes.string,
  onVoteGuess: PropTypes.func,
};
