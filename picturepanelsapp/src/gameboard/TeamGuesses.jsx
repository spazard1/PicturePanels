import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useSignalR } from "../signalr/useSignalR";
import { getCorrectGuessPlayers } from "./getCorrectGuessPlayers";
import Avatar from "../avatars/Avatar";
import Color from "color";

import "./TeamGuesses.css";

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
  const [teamGuessesVisible, setTeamGuessesVisible] = useState(false);
  const [hasTeamGuessBeenVisible, setHasTeamGuessBeenVisible] = useState(false);
  const [teamOneGuessCorrectDisplay, setTeamOneGuessCorrectDisplay] = useState("");
  const [teamTwoGuessCorrectDisplay, setTeamTwoGuessCorrectDisplay] = useState("");
  const [teamOneGuessTextDisplay, setTeamOneGuessTextDisplay] = useState("");
  const [teamTwoGuessTextDisplay, setTeamTwoGuessTextDisplay] = useState("");
  const [isTeamGuessCorrect, setIsTeamGuessCorrect] = useState("");
  const [bothTeamsPass, setBothTeamsPass] = useState(false);
  const [correctGuessPlayers, setCorrectGuessPlayers] = useState();
  const [correctGuessPlayersVisible, setCorrectGuessPlayersVisible] = useState(false);

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
      setTeamGuessesVisible(false);
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

    setTeamGuessesVisible(true);
    setIsTeamGuessCorrect(false);
    setTeamOneGuessCorrectDisplay("");
    setTeamTwoGuessCorrectDisplay("");

    if ((teamOneGuessStatus === "Pass" || teamOneGuessStatus === "Skip") && (teamTwoGuessStatus === "Pass" || teamTwoGuessStatus === "Skip")) {
      playBothTeamsPassSound();
      setBothTeamsPass(true);
      return;
    }
    setBothTeamsPass(false);

    setTimeout(() => {
      setTeamOneGuessCorrectDisplay(teamOneCorrect ? "Correct" : teamOneGuessStatus === "Guess" ? "Incorrect" : "");
      setTeamTwoGuessCorrectDisplay(teamTwoCorrect ? "Correct" : teamTwoGuessStatus === "Guess" ? "Incorrect" : "");
      setIsTeamGuessCorrect(teamOneCorrect || teamTwoCorrect);
      if (teamOneCorrect || teamTwoCorrect) {
        playCorrectSound();

        setTimeout(() => {
          setCorrectGuessPlayersVisible(true);
        }, 6000);
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
  ]);

  useEffect(() => {
    if (teamGuessesVisible) {
      setHasTeamGuessBeenVisible(true);
    }
  }, [teamGuessesVisible]);

  return (
    <>
      {bothTeamsPass && (
        <div
          className={classNames("bothTeamsPass", "animate__animated", {
            hidden: !hasTeamGuessBeenVisible,
            animate__zoomIn: teamGuessesVisible,
            animate__zoomOut: !teamGuessesVisible,
          })}
        >
          Both Teams Pass
        </div>
      )}
      {!bothTeamsPass && (
        <>
          <div
            className={classNames("teamGuessContainer teamOneGuessContainer", {
              teamOneGuessContainerCorrect: isTeamGuessCorrect,
            })}
          >
            <div
              className={classNames("teamGuess", "animate__animated", "teamGuessTeamOne teamOneBox", {
                hidden: !hasTeamGuessBeenVisible,
                animate__slideInLeft: teamGuessesVisible && teamOneGuessCorrectDisplay === "",
                animate__slideOutLeft: !teamGuessesVisible,
                teamGuessCorrect: teamOneGuessCorrectDisplay === "Correct",
                teamGuessIncorrect: teamOneGuessCorrectDisplay === "Incorrect",
                animate__pulse: teamOneGuessCorrectDisplay === "Correct" && teamGuessesVisible,
                "animate__delay-1s": teamOneGuessCorrectDisplay === "Correct" && teamGuessesVisible,
                "animate__repeat-5": teamOneGuessCorrectDisplay === "Correct" && teamGuessesVisible,
                teamGuessIsCorrect: isTeamGuessCorrect,
              })}
            >
              {teamOneGuessTextDisplay}
            </div>
            {correctGuessPlayers && correctGuessPlayers.teamOnePlayers && correctGuessPlayersVisible && (
              <div
                className={classNames("correctGuessPlayers teamOneBox animate__animated animate__fadeIn", {
                  animate__fadeOut: !teamGuessesVisible,
                })}
              >
                {correctGuessPlayers.teamOnePlayers.map((player) => (
                  <div key={player.playerId}>
                    <Avatar
                      className={"correctGuessPlayerAvatar"}
                      key={player.playerId}
                      avatar={player.avatar}
                      colors={player.colors.map((c) => Color(c))}
                    />
                    <div>{player.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="teamGuessContainer teamTwoGuessContainer teamTwoBox">
            <div
              className={classNames("teamGuess", "animate__animated", "teamGuessTeamTwo", {
                hidden: !hasTeamGuessBeenVisible,
                animate__slideInRight: teamGuessesVisible && teamTwoGuessCorrectDisplay === "",
                animate__slideOutRight: !teamGuessesVisible,
                teamGuessCorrect: teamTwoGuessCorrectDisplay === "Correct",
                teamGuessIncorrect: teamTwoGuessCorrectDisplay === "Incorrect",
                animate__pulse: teamTwoGuessCorrectDisplay === "Correct" && teamGuessesVisible,
                "animate__delay-1s": teamTwoGuessCorrectDisplay === "Correct" && teamGuessesVisible,
                "animate__repeat-5": teamTwoGuessCorrectDisplay === "Correct" && teamGuessesVisible,
                teamGuessIsCorrect: isTeamGuessCorrect,
              })}
            >
              {teamTwoGuessTextDisplay}
            </div>
            {correctGuessPlayers && correctGuessPlayers.teamTwoPlayers && (
              <div
                className={classNames("correctGuessPlayers animate__animated", {
                  hidden: !hasTeamGuessBeenVisible,
                  animate__fadeIn: teamGuessesVisible,
                  "animate__delay-15s": teamGuessesVisible,
                  animate__fadeOut: !teamGuessesVisible,
                })}
              >
                {correctGuessPlayers.teamTwoPlayers.map((player) => (
                  <div key={player.playerId}>
                    <Avatar
                      className={"correctGuessPlayerAvatar"}
                      key={player.playerId}
                      avatar={player.avatar}
                      colors={player.colors.map((c) => Color(c))}
                    />
                    <div>{player.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
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
