import React, { useCallback, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";
import Tags from "@yaireo/tagify/dist/react.tagify";

import "@yaireo/tagify/dist/tagify.css";
import "../Tagify.css";
import "./Modal.css";
import "./ModalEditImage.css";

const ModalEditImage = ({ tags, imageDetails, onEditImage, onModalClose }) => {
  const defaultTags = imageDetails.tags;

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

  const [errorMessage, setErrorMessage] = useState("");

  const [formValues, setFormValues] = useState({
    name: imageDetails.name,
    alternativeNames: imageDetails.alternativeNames
      .split(",")
      .filter((e) => e)
      .concat(["", "", ""])
      .slice(0, 3),
    tags: imageDetails.tags,
  });

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

  const onModalCloseHelper = () => {
    setFormValues({ ...formValues, password: "", confirmPassword: "" });
    onModalClose();
  };

  const onClickEditImage = () => {
    setErrorMessage("");

    if (formValues.name.length < 2) {
      setErrorMessage("Name must be at least 2 characters.");
      return;
    }

    onEditImage({ ...formValues, alternativeNames: formValues.alternativeNames.join(",") });
  };

  return (
    <Modal show={true} onHide={onModalCloseHelper}>
      <Modal.Header>Edit Image Details</Modal.Header>
      <Modal.Body>
        <div className="modalError">{errorMessage}</div>
        <div className="editImageContainer">
          <div className="editImageInputContainer editImageNameContainer">
            <input
              name="name"
              value={formValues.name}
              placeholder="image name"
              onChange={onInputChange}
              type="text"
              autoComplete="off"
              maxLength="100"
            />
          </div>

          <div className="editImageInputContainer editOtherNamesInputContainer">
            <input
              name="alternativeNames_0"
              placeholder="other name 1"
              value={formValues.alternativeNames[0]}
              onChange={onInputChange}
              type="text"
              autoComplete="off"
              maxLength="100"
            />
            <input
              name="alternativeNames_1"
              placeholder="other name 2"
              value={formValues.alternativeNames[1]}
              onChange={onInputChange}
              type="text"
              autoComplete="off"
              maxLength="100"
            />
            <input
              name="alternativeNames_2"
              placeholder="other name 3"
              value={formValues.alternativeNames[2]}
              onChange={onInputChange}
              type="text"
              autoComplete="off"
              maxLength="100"
            />
          </div>

          <div className="editImageInputContainer editTagsInputContainer">
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
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="cancelButton"
          variant="secondary"
          onClick={() => {
            onModalClose();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onClickEditImage(formValues);
          }}
        >
          Save Image
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditImage;

ModalEditImage.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  showModal: PropTypes.bool,
  imageDetails: PropTypes.object,
  onEditImage: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired,
};
