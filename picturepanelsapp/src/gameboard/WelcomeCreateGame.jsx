import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const WelcomeCreateGame = () => {
  const gameStateIdRef = useRef();

  useEffect(() => {
    gameStateIdRef.current.value = localStorage.getItem("gameStateId");
  });

  return (
    <>
      <div className="welcomeText welcomeCreateGame">
        <div className="welcomeCreateGameMessage">Creating a new game... Set it up how you want!</div>
        <div className="welcomeGameStateOptions">
          <input className="welcomeGameStateTeamName welcomeGameStateInput" autoComplete="off" maxLength="30" />
          VS.
          <input className="welcomeGameStateTeamName welcomeGameStateInput" autoComplete="off" maxLength="30" />
          <div className="welcomeTagsMessage">
            All images are included by default. Use included tags if you only want certain categories in your game.
          </div>
          <div id="tagsInputContainer" className="tagsInputContainer center">
            Included Tags:
            <span data-toggle="tooltip" title="If you want only certain types of images to be included in your game, add those tags here."></span>
            <tags className="tagify tagsInput tagsInputSetupDefault tagify--noTags tagify--empty">
              <span
                data-placeholder="​"
                aria-placeholder=""
                className="tagify__input"
                role="textbox"
                aria-autocomplete="both"
                aria-multiline="false"
              ></span>
            </tags>
            <input id="tagsInput" name="input-custom-dropdown" className="tagsInput tagsInputSetupDefault" />
          </div>
          <div id="excludedTagsInputContainer" className="tagsInputContainer center">
            Excluded Tags:
            <span
              data-toggle="tooltip"
              title="Images with these tags will not be included in your game, even if they match one of the included tags."
            ></span>
            <tags className="tagify tagsInput tagify--noTags tagify--empty">
              <span
                data-placeholder="​"
                aria-placeholder=""
                className="tagify__input"
                role="textbox"
                aria-autocomplete="both"
                aria-multiline="false"
              ></span>
            </tags>
            <input id="excludedTagsInput" name="input-custom-dropdown" className="tagsInput" />
          </div>
          <div className="welcomeGameStateDropdownOptions">
            <div>
              Open Panel Time:
              <span
                data-toggle="tooltip"
                title="How much time should a team be given to vote for panels to open?
                     When time runs out, the most voted panel is automatically opened."
              ></span>
              <select id="welcomeOpenPanelTime">
                <option value="30" selected="selected">
                  30 seconds
                </option>
                <option value="60">1 minute</option>
                <option value="90">1.5 minutes</option>
                <option value="120">2 minutes</option>
                <option value="0">No Limit</option>
              </select>
              &nbsp;&nbsp;&nbsp; Guessing Time:
              <span
                data-toggle="tooltip"
                title="How much time should a team be given to add and vote for guesses?
                      When time runs out, the most voted guess is automatically submitted."
              ></span>
              <select id="welcomeGuessTime">
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="90" selected="selected">
                  1.5 minutes
                </option>
                <option value="120">2 minutes</option>
                <option value="150">2.5 minutes</option>
                <option value="180">3 minutes</option>
                <option value="0">No Limit</option>
              </select>
            </div>
            <div className="welcomeGameStateDropdownSubOptions">
              Wrong Guess Penalty:
              <span data-toggle="tooltip" title="If a team makes a wrong guess, what should the penalty be?"></span>
              <select id="welcomeWrongGuessPenalty">
                <option value="0">None</option>
                <option value="-1" selected="selected">
                  -1 Point
                </option>
                <option value="-2">-2 Points</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeCreateGame;

WelcomeCreateGame.propTypes = {
  onCreateGame: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
