import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import "@yaireo/tagify/dist/tagify.css";
import "../common/Tagify.css";
import Tags from "@yaireo/tagify/dist/react.tagify";
import { useTags } from "../common/useTags";
import { useQueryString } from "../common/useQueryString";

const WelcomeCreateGame = ({ onCancel, onCreateGame }) => {
  const { tags } = useTags();
  const defaultTags = useQueryString("tags");

  const [formValues, setFormValues] = useState({
    teamOneName: "Team 1",
    teamTwoName: "Team 2",
    openPanelTime: 30,
    guessTime: 90,
    wrongGuessPenalty: -1,
    includedTags: defaultTags,
  });

  const tagifySettings = {
    originalInputValueFormat: (valuesArr) => valuesArr.map((item) => item.value).join(","),
    maxTags: 6,
    userInput: false,
    dropdown: {
      maxItems: 30, // <- mixumum allowed rendered suggestions
      classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
      enabled: 0, // <- show suggestions on focus
      closeOnSelect: false, // <- do not hide the suggestions dropdown once an item has been selected
      placeAbove: true,
    },
  };

  const createGameOnClick = () => {
    console.log(formValues);
    onCreateGame();
  };

  const onInputChange = useCallback(
    (event) => {
      console.log(event.target.value, typeof event.target.value);
      setFormValues({ ...formValues, [event.target.name]: event.target.value });
    },
    [formValues]
  );

  const onInputNumberChange = useCallback(
    (event) => {
      setFormValues({ ...formValues, [event.target.name]: +event.target.value });
    },
    [formValues]
  );

  const onTagsChange = (formName, e) => {
    setFormValues((fv) => {
      return { ...fv, [formName]: e.detail.value };
    });
  };

  return (
    <>
      <div className="welcomeText welcomeCreateGame">
        <div className="welcomeCreateGameMessage">Creating a new game... Set it up how you want!</div>
        <div className="welcomeGameStateOptions">
          <input
            name="teamOneName"
            className="welcomeGameStateTeamName welcomeGameStateInput"
            value={formValues.teamOneName}
            autoComplete="off"
            maxLength="30"
            onChange={onInputChange}
          />
          VS.
          <input
            name="teamTwoName"
            className="welcomeGameStateTeamName welcomeGameStateInput"
            value={formValues.teamTwoName}
            autoComplete="off"
            maxLength="30"
            onChange={onInputChange}
          />
          <div className="welcomeTagsMessage">
            All images are included by default. Use included tags if you only want certain categories in your game.
          </div>
          <div className="tagsInputContainer center">
            Included Tags:
            <span data-toggle="tooltip" title="If you want only certain types of images to be included in your game, add those tags here."></span>
            <Tags
              name="includedTags"
              settings={tagifySettings}
              className="tagsInput"
              defaultValue={defaultTags}
              whitelist={tags}
              onChange={(e) => onTagsChange("includedTags", e)}
            />
          </div>
          <div className="tagsInputContainer center">
            Excluded Tags:
            <span
              data-toggle="tooltip"
              title="Images with these tags will not be included in your game, even if they match one of the included tags."
            ></span>
            <Tags
              name="excludedTags"
              settings={tagifySettings}
              className="tagsInput"
              whitelist={tags}
              onChange={(e) => onTagsChange("excludedTags", e)}
            />
          </div>
          <div className="welcomeGameStateDropdownOptions">
            <div>
              Open Panel Time:
              <span
                data-toggle="tooltip"
                title="How much time should a team be given to vote for panels to open?
                     When time runs out, the most voted panel is automatically opened."
              ></span>
              <select name="openPanelTime" value={formValues.openPanelTIme} onChange={onInputNumberChange}>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={90}>1.5 minutes</option>
                <option value={120}>2 minutes</option>
                <option value={0}>No Limit</option>
              </select>
              &nbsp;&nbsp;&nbsp; Guessing Time:
              <span
                data-toggle="tooltip"
                title="How much time should a team be given to add and vote for guesses?
                      When time runs out, the most voted guess is automatically submitted."
              ></span>
              <select name="guessTime" value={formValues.guessTime} onChange={onInputNumberChange}>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={90}>1.5 minutes</option>
                <option value={120}>2 minutes</option>
                <option value={150}>2.5 minutes</option>
                <option value={180}>3 minutes</option>
                <option value={0}>No Limit</option>
              </select>
            </div>
            <div className="welcomeGameStateDropdownSubOptions">
              Wrong Guess Penalty:
              <span data-toggle="tooltip" title="If a team makes a wrong guess, what should the penalty be?"></span>
              <select name="wrongGuessPenalty" value={formValues.wrongGuessPenalty} onChange={onInputNumberChange}>
                <option value={0}>None</option>
                <option value={-1}>-1 Point</option>
                <option value={-2}>-2 Points</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="startGameButtons center">
        <div className="center defaultButton welcomeButton" onClick={onCancel}>
          Cancel
        </div>
        <div className="center defaultButton welcomeButton" onClick={createGameOnClick}>
          Create Game
        </div>
      </div>
    </>
  );
};

export default WelcomeCreateGame;

WelcomeCreateGame.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onCreateGame: PropTypes.func.isRequired,
};
