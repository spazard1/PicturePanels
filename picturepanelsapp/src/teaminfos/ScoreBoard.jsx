import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import TeamScoreChange from "./TeamScoreChange";
import { useSignalR } from "../signalr/useSignalR";
import "./ScoreBoard.css";

function ScoreBoard({ teamOneScore, teamTwoScore, isGamePaused, teamTurn, turnType }) {
  const [turnTypeDisplay, setTurnTypeDisplay] = useState("");
  const [scoreChange, setScoreChange] = useState({});
  const [scoreDisplay, setScoreDisplay] = useState({ teamOne: 0, teamTwo: 0 });
  const intervalRef = useRef();

  useSignalR("ScoreChange", (scoreChange) => {
    setScoreChange(scoreChange);
  });

  useEffect(() => {
    clearInterval(intervalRef.current);

    if (turnType === "OpenPanel" || turnType === "MakeGuess") {
      intervalRef.current = setTimeout(() => {
        setScoreDisplay({ teamOne: teamOneScore, teamTwo: teamTwoScore });
      }, 3000);
    } else {
      setScoreDisplay({ teamOne: teamOneScore, teamTwo: teamTwoScore });
    }
  }, [teamOneScore, teamTwoScore, turnType]);

  useEffect(() => {
    if (!turnType) {
      setTurnTypeDisplay("");
    } else if (turnType === "Welcome") {
      setTurnTypeDisplay("Welcome");
    } else if (isGamePaused) {
      setTurnTypeDisplay("Paused");
    } else if (turnType === "OpenPanel" && teamTurn === 1) {
      setTurnTypeDisplay("← Open a Panel");
    } else if (turnType === "OpenPanel" && teamTurn === 2) {
      setTurnTypeDisplay("Open a Panel →");
    } else if (turnType === "MakeGuess") {
      setTurnTypeDisplay("Guess or Pass");
    } else if (turnType === "GuessesMade") {
      setTurnTypeDisplay("Who was right?");
    } else if (turnType === "EndRound") {
      setTurnTypeDisplay("Round Over");
    } else if (turnType === "EndGame") {
      setTurnTypeDisplay("Congratulations");
    }
  }, [teamTurn, turnType, isGamePaused]);

  return (
    <div className="scoreBoard">
      <div className="teamScore teamOneBox">
        <div>{scoreDisplay.teamOne}</div>
        <TeamScoreChange teamNumber={1} scoreChange={scoreChange.teamOne} turnType={turnType}></TeamScoreChange>
      </div>
      <div className="teamInfo gameStatus">{turnTypeDisplay}</div>
      <div className="teamScore teamTwoBox">
        <div>{scoreDisplay.teamTwo}</div>
        <TeamScoreChange teamNumber={2} scoreChange={scoreChange.teamTwo} turnType={turnType}></TeamScoreChange>
      </div>
    </div>
  );
}

ScoreBoard.propTypes = {
  teamOneScore: PropTypes.number.isRequired,
  teamTwoScore: PropTypes.number.isRequired,
  isGamePaused: PropTypes.bool.isRequired,
  teamTurn: PropTypes.number,
  turnType: PropTypes.string,
};

export default ScoreBoard;
