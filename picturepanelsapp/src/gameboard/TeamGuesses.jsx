import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useSignalR } from "../signalr/useSignalR";
import Avatar from "../avatars/Avatar";
import getVotingPlayers from "./getVotingPlayers";

import "./TeamGuesses.css";

const TeamGuesses = ({
  gameStateId,
  teamOneGuess,
  teamOneGuessStatus,
  teamOneGuessIncorrect,
  teamTwoGuess,
  teamTwoGuessStatus,
  teamTwoGuessIncorrect,
  turnType,
}) => {
  const [teamGuessesVisible, setTeamGuessesVisible] = useState(false);
  const [hasTeamGuessBeenVisible, setHasTeamGuessBeenVisible] = useState(false);
  const [teamOneGuessIncorrectDisplay, setTeamOneGuessIncorrectDisplay] = useState(false);
  const [teamTwoGuessIncorrectDisplay, setTeamTwoGuessIncorrectDisplay] = useState(false);
  const [votingPlayers, setVotingPlayers] = useState({});

  const connectionId = useSignalR("VotingPlayers", (vp) => {
    setVotingPlayers(vp);
  });

  useEffect(() => {
    if (!gameStateId || !connectionId) {
      return;
    }

    getVotingPlayers(gameStateId, (vp) => {
      if (vp) {
        setVotingPlayers(vp);
      }
    });
  }, [gameStateId, connectionId]);

  useEffect(() => {
    if (turnType !== "GuessesMade") {
      setTeamGuessesVisible(false);

      return;
    }

    setTeamGuessesVisible(true);

    if (teamOneGuessStatus === "Skip" && teamTwoGuessStatus === "Skip") {
      console.log("todo");
    }

    if (teamOneGuessStatus === "Guess") {
      setTeamOneGuessIncorrectDisplay(false);
      setTimeout(() => {
        setTeamOneGuessIncorrectDisplay(teamOneGuessIncorrect);
      }, 8000);
    }

    if (teamTwoGuessStatus === "Guess") {
      setTeamOneGuessIncorrectDisplay(false);
      setTimeout(() => {
        setTeamTwoGuessIncorrectDisplay(teamTwoGuessIncorrect);
      }, 8000);
    }
  }, [teamOneGuessStatus, teamOneGuessIncorrect, teamTwoGuessStatus, teamTwoGuessIncorrect, turnType]);

  useEffect(() => {
    if (teamGuessesVisible) {
      setHasTeamGuessBeenVisible(true);
    }
  }, [teamGuessesVisible]);

  return (
    <>
      <div
        className={classNames("teamGuess", "animate__animated", "teamOneBox", "teamGuessTeamOne", {
          hidden: !hasTeamGuessBeenVisible,
          animate__slideInLeft: teamGuessesVisible,
          animate__slideOutLeft: !teamGuessesVisible,
          teamGuessIncorrect: teamOneGuessIncorrectDisplay,
        })}
      >
        <div>{teamOneGuessStatus === "Pass" || teamOneGuessStatus === "Skip" ? "(team passed)" : teamOneGuess}</div>
        <div className="votingPlayersContainer">
          {votingPlayers.teamOneVotingPlayers?.map((player) => (
            <Avatar key={player.playerId} avatar={player.avatar} colors={player.colors} />
          ))}
        </div>
        <div className="notVotingPlayersContainer">
          {votingPlayers.teamOneNotVotingPlayers?.map((player) => (
            <Avatar key={player.playerId} avatar={player.avatar} colors={player.colors} />
          ))}
        </div>
      </div>
      <div
        className={classNames("teamGuess", "animate__animated", "teamTwoBox", "teamGuessTeamTwo", {
          hidden: !hasTeamGuessBeenVisible,
          animate__slideInRight: teamGuessesVisible,
          animate__slideOutRight: !teamGuessesVisible,
          teamGuessIncorrect: teamTwoGuessIncorrectDisplay,
        })}
      >
        <div>{teamTwoGuessStatus === "Pass" || teamTwoGuessStatus === "Skip" ? "(team passed)" : teamTwoGuess}</div>
        <div className="votingPlayersContainer">
          {votingPlayers.teamTwoVotingPlayers?.map((player) => (
            <Avatar key={player.playerId} avatar={player.avatar} colors={player.colors} />
          ))}
        </div>
        <div className="notVotingPlayersContainer">
          {votingPlayers.teamTwoNotVotingPlayers?.map((player) => (
            <Avatar key={player.playerId} avatar={player.avatar} colors={player.colors} />
          ))}
        </div>
      </div>
    </>
  );
};

export default TeamGuesses;

TeamGuesses.propTypes = {
  gameStateId: PropTypes.string,
  teamOneGuess: PropTypes.string,
  teamOneGuessStatus: PropTypes.string,
  teamOneGuessIncorrect: PropTypes.string,
  teamTwoGuess: PropTypes.string,
  teamTwoGuessStatus: PropTypes.string,
  teamTwoGuessIncorrect: PropTypes.string,
  turnType: PropTypes.string,
};
