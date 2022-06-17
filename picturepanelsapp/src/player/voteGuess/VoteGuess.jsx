import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import getTeamGuesses from "./getTeamGuesses";
import { Button } from "react-bootstrap";
import putGuessVote from "./putGuessVote";
import putReady from "./putReady";
import { useSignalR } from "../../signalr/useSignalR";
import AvatarName from "../../avatars/AvatarName";
import Color from "color";

import "./VoteGuess.css";

const VoteGuess = ({ isVisible, gameStateId, playerId, onVoteGuess }) => {
  const [teamGuesses, setTeamGuesses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const onClickOk = () => {
    putReady(gameStateId, playerId, (result) => {
      if (result) {
        onVoteGuess();
      }
    });
  };

  const onClickVoteGuess = (teamGuessId) => {
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
    if (!gameStateId || !playerId || !connectionId) {
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
          <div className="voteGuessMessage">No one from your team entered a guess. Wait for the other team to vote for their guess.</div>
          <div>
            <Button className="teamGuessOk" variant="info" onClick={() => onClickOk("Pass")}>
              OK!
            </Button>
          </div>
        </>
      )}
      {isLoaded && teamGuesses.length > 0 && (
        <>
          <div className="playerLabel voteGuessLabel">Vote for a guess</div>
          <div className="teamGuessesContainer">
            {teamGuesses.map((teamGuess) => (
              <Button key={teamGuess.teamGuessId} className="teamGuessButton" onClick={() => onClickVoteGuess(teamGuess.teamGuessId)}>
                <div
                  className={"teamGuessConfidence " + ("teamGuessConfidence" + Math.round(teamGuess.confidence / 10))}
                  style={{ height: Math.max(5, Math.round(teamGuess.confidence / 5) * 5) + "%" }}
                />
                <div className="teamGuessContainer">
                  <div className="teamGuessText">{teamGuess.guess}</div>
                  <div className="teamGuessPlayers">
                    {teamGuess.players.map((player) => (
                      <AvatarName
                        key={player.playerId}
                        className="voteGuessPlayerName"
                        avatar={player.avatar}
                        colors={player.colors.map((c) => new Color(c))}
                        name={player.name}
                        horizontal={true}
                      />
                    ))}
                  </div>
                </div>
                <div
                  className={"teamGuessConfidence " + ("teamGuessConfidence" + Math.round(teamGuess.confidence / 10))}
                  style={{ height: Math.max(5, Math.round(teamGuess.confidence / 5) * 5) + "%" }}
                />
              </Button>
            ))}
            <Button className="teamGuessPass" variant="secondary" onClick={() => onClickVoteGuess("Pass")}>
              Pass
            </Button>
          </div>
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
