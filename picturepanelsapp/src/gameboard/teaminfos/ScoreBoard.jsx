import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import TeamScoreChange from "./TeamScoreChange";
import { useSignalR } from "../../signalr/useSignalR";
import "./ScoreBoard.css";

function ScoreBoard({ teamOneScore, teamTwoScore, teamTurn, turnType }) {
  const [turnTypeDisplay, setTurnTypeDisplay] = useState("");
  const [scoreChange, setScoreChange] = useState({});
  const [scoreDisplay, setScoreDisplay] = useState({ teamOne: teamOneScore, teamTwo: teamTwoScore });
  const hasScoreLoaded = useRef(false);
  const intervalRef = useRef();

  useSignalR("ScoreChange", (scoreChange) => {
    setScoreChange(scoreChange);
  });

  useEffect(() => {
    clearInterval(intervalRef.current);

    if (turnType && !hasScoreLoaded.current) {
      setScoreDisplay({ teamOne: teamOneScore, teamTwo: teamTwoScore });
      hasScoreLoaded.current = true;
    } else if (turnType === "OpenPanel" || turnType === "MakeGuess") {
      intervalRef.current = setTimeout(() => {
        setScoreDisplay({ teamOne: teamOneScore, teamTwo: teamTwoScore });
      }, 3000);
    } else if (turnType === "GuessesMade") {
      intervalRef.current = setTimeout(() => {
        setScoreDisplay({ teamOne: teamOneScore, teamTwo: teamTwoScore });
      }, 12000);
    } else {
      setScoreDisplay({ teamOne: teamOneScore, teamTwo: teamTwoScore });
    }
  }, [turnType, teamOneScore, teamTwoScore]);

  useEffect(() => {
    if (!turnType) {
      setTurnTypeDisplay("");
    } else if (turnType === "Welcome") {
      setTurnTypeDisplay("Welcome");
    } else if (turnType === "OpenPanel" && teamTurn === 1) {
      setTurnTypeDisplay("← Open a Panel");
    } else if (turnType === "OpenPanel" && teamTurn === 2) {
      setTurnTypeDisplay("Open a Panel →");
    } else if (turnType === "MakeGuess") {
      setTurnTypeDisplay("Guess or Pass");
    } else if (turnType === "VoteGuess") {
      setTurnTypeDisplay("Vote for a Guess");
    } else if (turnType === "GuessesMade") {
      setTurnTypeDisplay("Who was right?");
    } else if (turnType === "EndRound") {
      setTurnTypeDisplay("Round Over");
    } else if (turnType === "EndGame") {
      setTurnTypeDisplay("Congratulations");
    }
  }, [teamTurn, turnType]);

  return (
    <div className="scoreBoard">
      <div className="teamScore teamOneBox">
        <div>{scoreDisplay.teamOne}</div>
        <TeamScoreChange teamNumber={1} scoreChange={scoreChange.teamOne} changeType={scoreChange.changeType} turnType={turnType}></TeamScoreChange>
      </div>
      <div className="teamInfo gameStatus">{turnTypeDisplay}</div>
      <div className="teamScore teamTwoBox">
        <div>{scoreDisplay.teamTwo}</div>
        <TeamScoreChange teamNumber={2} scoreChange={scoreChange.teamTwo} changeType={scoreChange.changeType} turnType={turnType}></TeamScoreChange>
      </div>
    </div>
  );
}

ScoreBoard.propTypes = {
  teamOneScore: PropTypes.number.isRequired,
  teamTwoScore: PropTypes.number.isRequired,
  teamTurn: PropTypes.number,
  turnType: PropTypes.string,
};

export default React.memo(ScoreBoard);
