import React, { useCallback, useState } from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";
import UploadUserLogin from "./UploadUserLogin";
import serverUrl from "../common/ServerUrl";
import { useTags } from "../common/useTags";
import { useQueryString } from "../common/useQueryString";
import Tags from "@yaireo/tagify/dist/react.tagify";

import "@yaireo/tagify/dist/tagify.css";
import "../common/Tagify.css";
import "./SetImageInfo.css";

export default function SetImageInfo({ isLoading, imageId, onStartOver, onSaveImage }) {
  const { tags } = useTags();
  const defaultTags = useQueryString("tags");

  const [formValues, setFormValues] = useState({
    name: "",
    alternativeNames: ["", "", ""],
    tags: defaultTags,
  });

  const tagifySettings = {
    originalInputValueFormat: (valuesArr) => valuesArr.map((item) => item.value).join(","),
    maxTags: 6,
    userInput: true,
    placeholder: "tags",
    dropdown: {
      maxItems: 30,
      classname: "tags-look",
      enabled: 0,
      closeOnSelect: false,
      placeAbove: true,
    },
  };

  const onInputChange = useCallback(
    (event) => {
      const targetName = event.target.name.split("_");
      if (targetName.length > 1) {
        const keyName = targetName[0];
        const index = parseInt(targetName[1]);
        const oldValue = formValues[keyName];
        const newValue = [...oldValue];
        newValue[index] = event.target.value;
        setFormValues({ ...formValues, [targetName[0]]: newValue });
      } else {
        setFormValues({ ...formValues, [event.target.name]: event.target.value });
      }
    },
    [formValues]
  );

  const onTagsChange = (formName, e) => {
    setFormValues((fv) => {
      return { ...fv, [formName]: e.detail.value };
    });
  };

  const onClickSaveImage = useCallback(() => {
    onSaveImage({ ...formValues, alternativeNames: formValues.alternativeNames.join(",") });
  }, [formValues, onSaveImage]);

  return (
    <>
      <div className="uploadSidePanel">
        <div className="uploadTitle">Welcome to the Picture Panels upload page!</div>

        {<UploadUserLogin />}

        <div className="uploadStepInstructions">Step 3 of 3: Enter the image details.</div>

        <div className="imageInfoContainer">
          <div className="imageInputContainer instructionLabel">
            The name of the image is the answer that is accepted as correct and will be displayed when it is solved.
          </div>

          <div className="imageInputContainer imageNameContainer">
            <input
              name="name"
              value={formValues.name}
              placeholder="image name"
              onChange={onInputChange}
              type="text"
              autoComplete="off"
              maxLength="100"
              disabled={isLoading}
            />
          </div>

          <div className="imageInputContainer instructionLabel">
            Often there will be more than one answer for an image. These other names will also be accepted as correct answers.
            {" For example, for an image from 'Star Wars: The Empire Strikes Back', "}
            {"other names would include 'Star Wars: Episode 5' and 'The Empire Strikes Back.'"}
          </div>

          <div className="imageInputContainer">
            <div className="otherNamesInputContainer">
              <input
                name="alternativeNames_0"
                placeholder="other name 1"
                value={formValues.alternativeNames[0]}
                onChange={onInputChange}
                type="text"
                autoComplete="off"
                maxLength="100"
                disabled={isLoading}
              />
              <input
                name="alternativeNames_1"
                placeholder="other name 2"
                value={formValues.alternativeNames[1]}
                onChange={onInputChange}
                type="text"
                autoComplete="off"
                maxLength="100"
                disabled={isLoading}
              />
              <input
                name="alternativeNames_2"
                placeholder="other name 3"
                value={formValues.alternativeNames[2]}
                onChange={onInputChange}
                type="text"
                autoComplete="off"
                maxLength="100"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="imageInputContainer instructionLabel">
            Tags allow images to be filtered when creating games, to customize which types of images will be in the game.
            <br />
            {"At a minimum, it's good to tag your image with it's year, genres(s), and rating."}
          </div>

          <div className="imageInputContainer tagsInputContainer">
            <Tags
              name="tags"
              settings={tagifySettings}
              className="uploadTagsInput"
              defaultValue={defaultTags}
              whitelist={tags}
              disabled={isLoading}
              onChange={(e) => onTagsChange("tags", e)}
            />
          </div>
        </div>

        <div className="uploadButtonsContainer">
          <Button variant="light" className="uploadButton" onClick={onStartOver} disabled={isLoading}>
            Start Over
          </Button>
          <Button variant="info" className="uploadButton" onClick={onClickSaveImage} disabled={isLoading || formValues?.name.length < 2}>
            Save Image Details
          </Button>
        </div>
      </div>
      <div className="uploadMainPanel">
        <div className="uploadImagePreviewContainer">
          <img className="uploadImagePreview" src={serverUrl + "api/images/" + imageId} />
        </div>
      </div>
    </>
  );
}

SetImageInfo.propTypes = {
  isLoading: PropTypes.bool,
  imageId: PropTypes.string.isRequired,
  onStartOver: PropTypes.func.isRequired,
  onSaveImage: PropTypes.func.isRequired,
};
