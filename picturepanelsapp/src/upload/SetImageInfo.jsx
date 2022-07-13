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

export default function SetImageInfo({ imageId, onStartOver, onSaveImage }) {
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
      console.log(formValues);

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
          <div className="imageInputContainer imageNameContainer">
            Image Name: <span data-toggle="tooltip" title="This is the name displayed when an image is solved."></span>
            <br />
            <input name="name" value={formValues.name} onChange={onInputChange} type="text" autoComplete="off" maxLength="100" />
          </div>

          <div className="imageInputContainer otherNamesLabel">
            Often there will be more than one answer for an image. The image name and these other names will all be accepted as correct answers.
          </div>

          <div className="imageInputContainer">
            Other Names:{" "}
            <span
              data-toggle="tooltip"
              title="For example, for an image from 'Star Wars: The Empire Strikes Back', 
						other names would include 'Star Wars: Episode 5' and 'The Empire Strikes Back.'"
            ></span>
            <div className="otherNamesInputContainer">
              <div>
                <input
                  name="alternativeNames_0"
                  value={formValues.alternativeNames[0]}
                  onChange={onInputChange}
                  type="text"
                  autoComplete="off"
                  maxLength="100"
                />
              </div>
              <div>
                <input
                  name="alternativeNames_1"
                  value={formValues.alternativeNames[1]}
                  onChange={onInputChange}
                  type="text"
                  autoComplete="off"
                  maxLength="100"
                />
              </div>
              <div>
                <input
                  name="alternativeNames_2"
                  value={formValues.alternativeNames[2]}
                  onChange={onInputChange}
                  type="text"
                  autoComplete="off"
                  maxLength="100"
                />
              </div>
            </div>
          </div>

          <div className="imageInputContainer tagsInputContainer">
            Tags:{" "}
            <span
              data-toggle="tooltip"
              title="Tags allow images to be filtered when creating games, to customize which types of images will be in the game."
            ></span>
            <Tags
              name="tags"
              settings={tagifySettings}
              className="uploadTagsInput"
              defaultValue={defaultTags}
              whitelist={tags}
              onChange={(e) => onTagsChange("tags", e)}
            />
          </div>
        </div>

        <div className="cropperButtons">
          <Button variant="light" className="cropperButton" onClick={onStartOver}>
            Start Over
          </Button>
          <Button variant="info" className="cropperButton" onClick={onClickSaveImage}>
            Save Image
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
  imageId: PropTypes.string.isRequired,
  onStartOver: PropTypes.func.isRequired,
  onSaveImage: PropTypes.func.isRequired,
};
