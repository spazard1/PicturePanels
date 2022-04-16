import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const EndGameRound = ({ gameStateId, gameRound }) => {
  return (
    <div className="gameRound animate__animated animate__fadeInDown animate__slow">
      {gameRound.roundNumber > 5 && (
        <img
          className="thumbnail"
          src={"https://picturepanels.azurewebsites.net/api/images/thumbnails/" + gameStateId + "/" + gameRound.roundNumber}
        />
      )}
      <div className="gameRoundScoreContainer">
        <div className={classNames("gameRoundScore", "teamOneBox", { gameRoundScoreZero: gameRound.teamOneScore === 0 })}>
          {gameRound.teamOneScore}
        </div>
        <div className={classNames("gameRoundScore", "teamTwoBox", { gameRoundScoreZero: gameRound.teamTwoScore === 0 })}>
          {gameRound.teamTwoScore}
        </div>
      </div>
      {gameRound.roundNumber <= 5 && (
        <img
          className="thumbnail"
          src={"https://picturepanels.azurewebsites.net/api/images/thumbnails/" + gameStateId + "/" + gameRound.roundNumber}
        />
      )}
    </div>
  );
};

export default EndGameRound;

EndGameRound.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  gameRound: PropTypes.object.isRequired,
};
