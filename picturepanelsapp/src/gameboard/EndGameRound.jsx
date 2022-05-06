import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import serverUrl from "../common/ServerUrl";

const EndGameRound = ({ gameStateId, gameRound }) => {
  return (
    <div className="gameRound animate__animated animate__fadeInDown animate__slow">
      {gameRound.roundNumber > 5 && (
        <img className="thumbnail" src={serverUrl + "api/images/thumbnails/" + gameStateId + "/" + gameRound.roundNumber} />
      )}
      <div className="gameRoundScoreContainer">
        <div
          className={classNames("gameRoundScore", {
            teamOneBox: gameRound.teamOneScore > gameRound.teamTwoScore,
            teamTwoBox: gameRound.teamOneScore < gameRound.teamTwoScore,
            gameRoundScoreZero: gameRound.teamOneScore === gameRound.teamTwoScore,
          })}
        >
          {gameRound.teamOneScore === gameRound.teamTwoScore && <>&ndash;</>}
          {gameRound.teamOneScore !== gameRound.teamTwoScore && <>+{Math.abs(gameRound.teamOneScore - gameRound.teamTwoScore)}</>}
        </div>
      </div>
      {gameRound.roundNumber <= 5 && (
        <img className="thumbnail" src={serverUrl + "api/images/thumbnails/" + gameStateId + "/" + gameRound.roundNumber} />
      )}
    </div>
  );
};

export default EndGameRound;

EndGameRound.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  gameRound: PropTypes.object.isRequired,
};
