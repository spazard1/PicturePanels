import React from "react";
import PropTypes from "prop-types";
import "@yaireo/tagify/dist/tagify.css";
import "../common/Tagify.css";
import Tags from "@yaireo/tagify/dist/react.tagify";
//import { useTags } from "../common/useTags";

const WelcomeCreateGame = ({ onCancel }) => {
  //const gameStateIdRef = useRef();

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

  //const { tags } = useTags();

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
          <div className="tagsInputContainer center">
            Included Tags:
            <span data-toggle="tooltip" title="If you want only certain types of images to be included in your game, add those tags here."></span>
            <Tags
              settings={tagifySettings} // tagify settings object
              className="tagsInput"
              //defaultValue="a,b,c"
              //whitelist={tags}
            />
          </div>
          <div className="tagsInputContainer center">
            Excluded Tags:
            <span
              data-toggle="tooltip"
              title="Images with these tags will not be included in your game, even if they match one of the included tags."
            ></span>
            <Tags
              settings={tagifySettings} // tagify settings object
              className="tagsInput"
              //defaultValue="a,b,c"
              //whitelist={tags}
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
              <select defaultValue={"30"}>
                <option value="30">30 seconds</option>
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
              <select defaultValue={"90"}>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="90">1.5 minutes</option>
                <option value="120">2 minutes</option>
                <option value="150">2.5 minutes</option>
                <option value="180">3 minutes</option>
                <option value="0">No Limit</option>
              </select>
            </div>
            <div className="welcomeGameStateDropdownSubOptions">
              Wrong Guess Penalty:
              <span data-toggle="tooltip" title="If a team makes a wrong guess, what should the penalty be?"></span>
              <select defaultValue={"-1"}>
                <option value="0">None</option>
                <option value="-1">-1 Point</option>
                <option value="-2">-2 Points</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="startGameButtons center">
        <div className="center defaultButton welcomeButton" onClick={onCancel}>
          Cancel
        </div>
        <div className="center defaultButton welcomeButton">Create Game</div>
      </div>
    </>
  );
};

export default WelcomeCreateGame;

WelcomeCreateGame.propTypes = {
  onCancel: PropTypes.func.isRequired,
};
