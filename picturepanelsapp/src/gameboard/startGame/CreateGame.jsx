import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Tags from "@yaireo/tagify/dist/react.tagify";
import { useTags } from "../../common/useTags";
import { useQueryString } from "../../common/useQueryString";
import { useTeamNames } from "./useTeamNames";
import { Button, Form } from "react-bootstrap";
import dice64 from "./../../common/classAnimation/dice-64.png";
import { useClassAnimation } from "../../common/classAnimation/useClassAnimation";
import classNames from "classnames";

import "@yaireo/tagify/dist/tagify.css";
import "../../common/Tagify.css";

import "./CreateGame.css";

const CreateGame = ({ isLoadingGame, onCancel, onCreateGame }) => {
  const [spinAnimation, setSpinAnimation] = useClassAnimation(250);
  const { teamNames, refreshTeamNames } = useTeamNames(setSpinAnimation);
  const { whitelistTags, queryTags, tagifySettings } = useTags();
  const theme = useQueryString("theme");

  const [formValues, setFormValues] = useState({
    teamOneName: "",
    teamTwoName: "",
    extendedTimers: false,
    shortGame: false,
    theme: theme,
    tags: queryTags,
    excludedTags: [],
  });

  useEffect(() => {
    if (!teamNames) {
      return;
    }
    setFormValues((fv) => {
      return { ...fv, teamOneName: teamNames.teamOneName, teamTwoName: teamNames.teamTwoName };
    });
  }, [teamNames]);

  const createGameOnClick = () => {
    onCreateGame({ ...formValues, tags: formValues.tags.map((tag) => tag.value), excludedTags: formValues.excludedTags.map((tag) => tag.value) });
  };

  const onInputChange = useCallback(
    (event) => {
      setFormValues({ ...formValues, [event.target.name]: event.target.value });
    },
    [formValues]
  );

  const onInputCheckedChange = useCallback(
    (event) => {
      setFormValues({ ...formValues, [event.target.name]: event.target.checked });
    },
    [formValues]
  );

  const onTagsChange = (formName, e) => {
    setFormValues((fv) => {
      return { ...fv, [formName]: e.detail.tagify.getCleanValue() };
    });
  };

  return (
    <>
      <div className="createGameText">Creating a new game... Set it up how you want!</div>
      <div className="createGameTeamNamesContainer">
        <input
          name="teamOneName"
          className="createGameTeamName createGameInput"
          value={formValues.teamOneName}
          autoComplete="off"
          maxLength="40"
          onChange={onInputChange}
          placeholder="Team 1"
        />
        <div>VS.</div>
        <input
          name="teamTwoName"
          className="createGameTeamName createGameInput"
          value={formValues.teamTwoName}
          autoComplete="off"
          maxLength="40"
          onChange={onInputChange}
          placeholder="Team 2"
        />
        <div className={classNames("teamNameRandomize", { spinAnimation: spinAnimation })} onClick={refreshTeamNames}>
          <img src={dice64} alt="randomize"></img>
        </div>
      </div>
      <div className="createGameTagsMessage">
        All images are included by default. Use included tags if you only want certain categories in your game.
      </div>
      <div className="createGameTagsInputContainer center">
        Included Tags:&nbsp;
        <span data-toggle="tooltip" title="If you want only certain types of images to be included in your game, add those tags here."></span>
        <Tags
          name="tags"
          settings={tagifySettings}
          className="tagsInput"
          defaultValue={queryTags}
          whitelist={whitelistTags}
          onChange={(e) => onTagsChange("tags", e)}
        />
      </div>
      <div className="createGameTagsInputContainer center">
        Excluded Tags:&nbsp;
        <span
          data-toggle="tooltip"
          title="Images with these tags will not be included in your game, even if they match one of the included tags."
        ></span>
        <Tags
          name="excludedTags"
          settings={tagifySettings}
          className="tagsInput"
          whitelist={whitelistTags}
          onChange={(e) => onTagsChange("excludedTags", e)}
        />
      </div>
      <div className="createGameToggleOptions">
        <div className="createGameToggleContainer">
          <span className="createGameNoWrap">Extended Timers:&nbsp;</span>
          <span data-toggle="tooltip" title="Lengthens the amount of time allowed for voting and guessing."></span>
          <Form.Check name="extendedTimers" type="switch" defaultChecked={formValues.extendedTimers} onChange={onInputCheckedChange} />
        </div>
        <div className="createGameToggleContainer">
          <span className="createGameNoWrap">Short Game:&nbsp;</span>
          <span data-toggle="tooltip" title="Short games are six rounds intead of ten."></span>
          <Form.Check name="shortGame" type="switch" defaultChecked={formValues.shortGame} onChange={onInputCheckedChange} />
        </div>
      </div>

      <div className="createGameButtons center">
        <Button variant="light" className="createGameButton" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" disabled={isLoadingGame} className="createGameButton" onClick={createGameOnClick}>
          {isLoadingGame ? "Creating..." : "Create Game"}
        </Button>
      </div>
    </>
  );
};

export default CreateGame;

CreateGame.propTypes = {
  isLoadingGame: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onCreateGame: PropTypes.func.isRequired,
};
