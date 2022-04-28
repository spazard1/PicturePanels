import React, { useState } from "react";
import PropTypes from "prop-types";
import "./TeamGuesses.css";
import xmark from "./x-mark.png";
import { useTeamGuesses } from "./useTeamGuesses";
import classNames from "classnames";
import postTeamGuess from "./postTeamGuess";
import deleteTeamGuess from "./deleteTeamGuess";
import ModalMessage from "../../common/modal/ModalMessage";
import ModalConfirm from "../../common/modal/ModalConfirm";
import { useModal } from "../../common/modal/useModal";
import ModalPrompt from "../../common/modal/ModalPrompt";
import putTeamGuessVote from "./putTeamGuessVote";
import putPlayerReadySolo from "./putPlayerReadySolo";
import { Button } from "react-bootstrap";

const TeamGuesses = ({ turnType, roundNumber, gameStateId, playerId, teamGuessVote, teamNumber, onTeamGuessVote }) => {
  const { teamGuesses, passVoteCount, currentTeamGuess, teamGuessesLoading, updateTeamGuessVoteCounts } = useTeamGuesses(
    gameStateId,
    playerId,
    roundNumber,
    teamNumber
  );
  const [modalMessage, setModalMessage, onModalClose] = useModal();
  const [modalConfirmMessage, setModalConfirmMessage, onModalConfirmClose] = useModal();
  const [modalPromptMessage, setModalPromptMessage, onModalPromptClose] = useModal();
  const [onModalConfirmResponse, setOnModalConfirmResponse] = useState();
  const [onModalPromptResponse, setOnModalPromptResponse] = useState();

  const addTeamGuessOnClick = () => {
    setModalPromptMessage("What is your guess?");

    setOnModalPromptResponse(() => (response) => {
      setModalPromptMessage("");

      if (response) {
        postTeamGuess(gameStateId, playerId, response, (result) => {
          if (!result) {
            setModalMessage("There was a problem creating your guess. Refresh the page and try again.");
          }
        });
      }
    });
  };

  const voteTeamGuessOnClick = (e, ticks) => {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();

    onTeamGuessVote(ticks);
    if (teamGuessVote === ticks) {
      updateTeamGuessVoteCounts(teamGuessVote, "");
    } else {
      updateTeamGuessVoteCounts(teamGuessVote, ticks);
    }

    const oldVote = teamGuessVote;
    putTeamGuessVote(gameStateId, playerId, ticks, (result) => {
      if (!result) {
        onTeamGuessVote(oldVote);
        updateTeamGuessVoteCounts(ticks, oldVote);
      }
    });
  };

  const deleteTeamGuessOnClick = (e, teamGuess) => {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();

    setModalConfirmMessage('Are you sure you want to delete the guess "' + teamGuess.guess + '"?');

    setOnModalConfirmResponse(() => (response) => {
      setModalConfirmMessage("");

      if (response) {
        deleteTeamGuess(gameStateId, playerId, teamGuess.ticks, (result) => {
          if (!result) {
            setModalMessage("There was a problem deleting the team guess. Refresh the page and try again.");
          }
        });
      }
    });
  };

  const submitOnClick = (e) => {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();

    if (teamGuessesLoading) {
      return;
    }

    if (currentTeamGuess) {
      setModalConfirmMessage('Are you sure you want to submit the guess "' + currentTeamGuess + '" for your team?');
    } else {
      setModalConfirmMessage("Are you sure you want pass this turn for your team?");
    }

    setOnModalConfirmResponse(() => (response) => {
      setModalConfirmMessage("");

      if (response) {
        putPlayerReadySolo(gameStateId, playerId, (result) => {
          if (!result) {
            setModalMessage("There was a problem submiting your team guess. Refresh the page and try again.");
          }
        });
      }
    });
  };

  if (turnType !== "MakeGuess") {
    return <></>;
  }

  return (
    <div className="center">
      <ModalMessage modalMessage={modalMessage} onModalClose={onModalClose}></ModalMessage>
      <ModalConfirm modalMessage={modalConfirmMessage} onModalResponse={onModalConfirmResponse} onModalClose={onModalConfirmClose}></ModalConfirm>
      <ModalPrompt modalMessage={modalPromptMessage} onModalResponse={onModalPromptResponse} onModalClose={onModalPromptClose}></ModalPrompt>

      <div className="teamGuessesContainer teamGuesses">
        {teamGuesses.map((teamGuess) => (
          <div key={teamGuess.ticks} className="teamGuessText" onClick={(e) => voteTeamGuessOnClick(e, teamGuess.ticks)}>
            <div
              className={classNames("teamGuessVoteCount", "animate__animated", {
                teamGuessVoteCountChosen: teamGuessVote === teamGuess.ticks,
                animate__pulse: teamGuessVote === teamGuess.ticks,
              })}
            >
              {teamGuess.voteCount}
            </div>
            {teamGuess.guess}
            <div className="teamGuessDeleteButton" onClick={(e) => deleteTeamGuessOnClick(e, teamGuess)}>
              <img src={xmark} />
            </div>
          </div>
        ))}
      </div>
      {!teamGuessesLoading && (
        <div className="teamGuesses">
          <div className="teamGuessText teamGuessPass" onClick={(e) => voteTeamGuessOnClick(e, "Pass")}>
            <div
              className={classNames("teamGuessVoteCount", "animate__animated", {
                teamGuessVoteCountChosen: teamGuessVote === "Pass",
                animate__pulse: teamGuessVote === "Pass",
              })}
            >
              {passVoteCount}
            </div>
            Pass
          </div>
          <div>
            <Button className={"teamGuessAddButton"} variant="info" onClick={addTeamGuessOnClick}>
              Add Guess
            </Button>
          </div>
        </div>
      )}
      <div className="teamGuessSubmitButtonContainer">
        <Button
          variant={currentTeamGuess ? "success" : "secondary"}
          onClick={submitOnClick}
          className={classNames("teamGuessSubmitButton", { teamGuessSubmitButtonPass: !currentTeamGuess || teamGuessesLoading })}
          disabled={teamGuessesLoading}
        >
          {teamGuessesLoading ? "Loading..." : currentTeamGuess ? 'Submit "' + currentTeamGuess + '"' : "pass this turn"}
        </Button>
      </div>
    </div>
  );
};

export default TeamGuesses;

TeamGuesses.propTypes = {
  turnType: PropTypes.string,
  roundNumber: PropTypes.number,
  gameStateId: PropTypes.string.isRequired,
  playerId: PropTypes.string,
  teamNumber: PropTypes.number,
  teamGuessVote: PropTypes.string,
  onTeamGuessVote: PropTypes.func.isRequired,
};
