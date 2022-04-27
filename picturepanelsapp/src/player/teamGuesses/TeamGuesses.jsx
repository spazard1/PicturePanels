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

const TeamGuesses = ({ gameStateId, player }) => {
  const { teamGuesses, passVoteCount } = useTeamGuesses(gameStateId, player);
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
        postTeamGuess(gameStateId, player.playerId, response, (result) => {
          if (!result) {
            setModalMessage("There was a problem creating your guess. Refresh the page and try again.");
          }
        });
      }
    });
  };

  const voteTeamGuessOnClick = (e, ticks) => {
    e.stopPropagation();

    putTeamGuessVote(gameStateId, player.playerId, ticks, () => {});
  };

  const deleteTeamGuessOnClick = (e, teamGuess) => {
    e.stopPropagation();

    setModalConfirmMessage('Are you sure you want to delete the guess "' + teamGuess.guess + '"?');

    setOnModalConfirmResponse(() => (response) => {
      setModalConfirmMessage("");

      if (response) {
        deleteTeamGuess(gameStateId, player.playerId, teamGuess.ticks, (result) => {
          if (!result) {
            setModalMessage("There was a problem deleting the team guess. Refresh the page and try again.");
          }
        });
      }
    });
  };

  return (
    <div className="center">
      <ModalMessage modalMessage={modalMessage} onModalClose={onModalClose}></ModalMessage>
      <ModalConfirm modalMessage={modalConfirmMessage} onModalResponse={onModalConfirmResponse} onModalClose={onModalConfirmClose}></ModalConfirm>
      <ModalPrompt modalMessage={modalPromptMessage} onModalResponse={onModalPromptResponse} onModalClose={onModalPromptClose}></ModalPrompt>

      <div className="teamGuessesContainer teamGuesses">
        {teamGuesses.map((teamGuess) => (
          <div key={teamGuess.ticks} className="teamGuessText" onClick={(e) => voteTeamGuessOnClick(e, teamGuess.ticks)}>
            <div className={classNames("teamGuessVoteCount", { teamGuessVoteCountChosen: player.teamGuessVote === teamGuess.ticks })}>
              {teamGuess.voteCount}
            </div>
            {teamGuess.guess}
            <div className="teamGuessDeleteButton" onClick={(e) => deleteTeamGuessOnClick(e, teamGuess)}>
              <img src={xmark} />
            </div>
          </div>
        ))}
      </div>
      <div className="teamGuesses">
        <div className="teamGuessText teamGuessPass" onClick={(e) => voteTeamGuessOnClick(e, "Pass")}>
          <div className="teamGuessVoteCount">{passVoteCount}</div>
          Pass
        </div>
        <div className="teamGuessText teamGuessAdd" onClick={addTeamGuessOnClick}>
          Add Guess
        </div>
      </div>
    </div>
  );
};

export default TeamGuesses;

TeamGuesses.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  player: PropTypes.object.isRequired,
};
