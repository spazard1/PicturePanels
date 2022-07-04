import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useSignalR } from "../signalr/useSignalR";
import { getCorrectGuessPlayers } from "./getCorrectGuessPlayers";
import Avatar from "../avatars/Avatar";
import Color from "color";

import "./TeamGuesses.css";
import { useContainerClassAnimation } from "../common/useContainerClassAnimation";

const TeamGuesses = ({
  gameStateId,
  teamOneGuess,
  teamOneGuessStatus,
  teamOneCorrect,
  teamTwoGuess,
  teamTwoGuessStatus,
  teamTwoCorrect,
  turnType,
  playCorrectSound,
  playIncorrectSound,
  playBothTeamsPassSound,
}) => {
  const [teamOneGuessVisibleClassName, setTeamOneGuessVisible] = useContainerClassAnimation("animate__slideInLeft", "animate__slideOutLeft");
  const [teamTwoGuessVisibleClassName, setTeamTwoGuessVisible] = useContainerClassAnimation("animate__slideInRight", "animate__slideOutRight");

  const [teamOnePlayersVisibleClassName, setTeamOnePlayersVisible] = useContainerClassAnimation("animate__fadeInUp", "hidden");
  const [teamTwoPlayersVisibleClassName, setTeamTwoPlayersVisible] = useContainerClassAnimation("animate__fadeInUp", "hidden");
  const [bothTeamsPassVisibleClassName, setBothTeamsPassVisible] = useContainerClassAnimation("animate__zoomIn", "animate__zoomOut");

  const [teamOneGuessCorrectDisplay, setTeamOneGuessCorrectDisplay] = useState("");
  const [teamTwoGuessCorrectDisplay, setTeamTwoGuessCorrectDisplay] = useState("");
  const [teamOneGuessTextDisplay, setTeamOneGuessTextDisplay] = useState("");
  const [teamTwoGuessTextDisplay, setTeamTwoGuessTextDisplay] = useState("");
  const [isTeamGuessCorrect, setIsTeamGuessCorrect] = useState("");
  const [correctGuessPlayers, setCorrectGuessPlayers] = useState();

  const connectionId = useSignalR("CorrectGuessPlayers", (cgp) => {
    setCorrectGuessPlayers(cgp);
  });

  useEffect(() => {
    if (!gameStateId && !connectionId) {
      return;
    }

    getCorrectGuessPlayers(gameStateId, (cgp) => {
      if (cgp) {
        setCorrectGuessPlayers(cgp);
      }
    });
  }, [gameStateId, connectionId]);

  useEffect(() => {
    if (turnType !== "GuessesMade") {
      setTeamOneGuessVisible(false);
      setTeamTwoGuessVisible(false);
      setTeamOnePlayersVisible(false);
      setTeamTwoPlayersVisible(false);
      setBothTeamsPassVisible(false);

      setTimeout(() => {
        setIsTeamGuessCorrect(false);
        setTeamOneGuessCorrectDisplay("");
        setTeamTwoGuessCorrectDisplay("");
      }, 2000);

      return;
    }

    if (teamOneGuessStatus === "Pass" || teamOneGuessStatus === "Skip") {
      setTeamOneGuessTextDisplay("(team passed)");
    } else {
      setTeamOneGuessTextDisplay(teamOneGuess);
    }

    if (teamTwoGuessStatus === "Pass" || teamTwoGuessStatus === "Skip") {
      setTeamTwoGuessTextDisplay("(team passed)");
    } else {
      setTeamTwoGuessTextDisplay(teamTwoGuess);
    }

    setIsTeamGuessCorrect(false);
    setTeamOneGuessCorrectDisplay("");
    setTeamTwoGuessCorrectDisplay("");

    if ((teamOneGuessStatus === "Pass" || teamOneGuessStatus === "Skip") && (teamTwoGuessStatus === "Pass" || teamTwoGuessStatus === "Skip")) {
      playBothTeamsPassSound();
      setBothTeamsPassVisible(true);
      setTeamOneGuessVisible(false);
      setTeamTwoGuessVisible(false);
      return;
    }

    setBothTeamsPassVisible(false);
    setTeamOneGuessVisible(true);
    setTeamTwoGuessVisible(true);

    setTimeout(() => {
      setTeamOneGuessCorrectDisplay(teamOneCorrect ? "Correct" : teamOneGuessStatus === "Guess" ? "Incorrect" : "");
      setTeamTwoGuessCorrectDisplay(teamTwoCorrect ? "Correct" : teamTwoGuessStatus === "Guess" ? "Incorrect" : "");
      setIsTeamGuessCorrect(teamOneCorrect || teamTwoCorrect);
      if (teamOneCorrect || teamTwoCorrect) {
        playCorrectSound();

        setTimeout(() => {
          setTeamOnePlayersVisible(true);
          setTeamTwoPlayersVisible(true);
        }, 11000);
      } else if (teamOneGuessStatus === "Guess" || teamTwoGuessStatus === "Guess") {
        playIncorrectSound();
      }
    }, 7000);
  }, [
    teamOneGuess,
    teamOneGuessStatus,
    teamOneCorrect,
    teamTwoGuess,
    teamTwoGuessStatus,
    teamTwoCorrect,
    turnType,
    playCorrectSound,
    playIncorrectSound,
    playBothTeamsPassSound,
    setTeamOneGuessVisible,
    setTeamTwoGuessVisible,
    setBothTeamsPassVisible,
    setTeamOnePlayersVisible,
    setTeamTwoPlayersVisible,
  ]);

  return (
    <>
      <div className={classNames("bothTeamsPass", "animate__animated", bothTeamsPassVisibleClassName)}>Both Teams Pass</div>
      <>
        <div
          className={classNames("teamGuessContainer teamOneGuessContainer animate__animated", teamOneGuessVisibleClassName, {
            teamGuessContainerCorrect: isTeamGuessCorrect,
            teamOneGuessContainerCorrect: isTeamGuessCorrect,
          })}
        >
          <div
            className={classNames("teamOneBox", "teamGuess", "teamGuessTeamOne", "animate__animated", {
              teamGuessCorrect: teamOneGuessCorrectDisplay === "Correct",
              teamGuessIncorrect: teamOneGuessCorrectDisplay === "Incorrect",
              animate__pulse: teamOneGuessCorrectDisplay === "Correct",
              "animate__delay-1s": teamOneGuessCorrectDisplay === "Correct",
              "animate__repeat-5": teamOneGuessCorrectDisplay === "Correct",
              teamGuessIsCorrect: isTeamGuessCorrect,
            })}
          >
            {teamOneGuessTextDisplay}
          </div>
          {correctGuessPlayers?.teamOnePlayers && correctGuessPlayers?.teamOnePlayers?.length > 0 && (
            <div className={classNames("correctGuessPlayers teamOneBox animate__animated", teamOnePlayersVisibleClassName)}>
              {correctGuessPlayers.teamOnePlayers.map((player) => (
                <div key={player.playerId}>
                  <Avatar
                    className={"correctGuessPlayerAvatar"}
                    key={player.playerId}
                    avatar={player.avatar}
                    colors={player.colors.map((c) => Color(c))}
                  />
                  <div className="correctGuessPlayerName">{player.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={classNames("teamGuessContainer teamTwoGuessContainer animate__animated", teamTwoGuessVisibleClassName, {
            teamGuessContainerCorrect: isTeamGuessCorrect,
            teamTwoGuessContainerCorrect: isTeamGuessCorrect,
          })}
        >
          <div
            className={classNames("teamTwoBox", "teamGuess", "teamGuessTeamTwo", "animate__animated", {
              teamGuessCorrect: teamTwoGuessCorrectDisplay === "Correct",
              teamGuessIncorrect: teamTwoGuessCorrectDisplay === "Incorrect",
              animate__pulse: teamTwoGuessCorrectDisplay === "Correct",
              "animate__delay-1s": teamTwoGuessCorrectDisplay === "Correct",
              "animate__repeat-5": teamTwoGuessCorrectDisplay === "Correct",
              teamGuessIsCorrect: isTeamGuessCorrect,
            })}
          >
            {teamTwoGuessTextDisplay}
          </div>
          {correctGuessPlayers?.teamTwoPlayers && correctGuessPlayers?.teamTwoPlayers?.length > 0 && (
            <div className={classNames("correctGuessPlayers teamTwoBox animate__animated", teamTwoPlayersVisibleClassName)}>
              {correctGuessPlayers.teamTwoPlayers.map((player) => (
                <div key={player.playerId}>
                  <Avatar
                    className={"correctGuessPlayerAvatar"}
                    key={player.playerId}
                    avatar={player.avatar}
                    colors={player.colors.map((c) => Color(c))}
                  />
                  <div className="correctGuessPlayerName">{player.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    </>
  );
};

export default TeamGuesses;

TeamGuesses.propTypes = {
  gameStateId: PropTypes.string,
  teamOneGuess: PropTypes.string,
  teamOneGuessStatus: PropTypes.string,
  teamOneCorrect: PropTypes.bool,
  teamTwoGuess: PropTypes.string,
  teamTwoGuessStatus: PropTypes.string,
  teamTwoCorrect: PropTypes.bool,
  turnType: PropTypes.string,
  playCorrectSound: PropTypes.func,
  playIncorrectSound: PropTypes.func,
  playBothTeamsPassSound: PropTypes.func,
};
