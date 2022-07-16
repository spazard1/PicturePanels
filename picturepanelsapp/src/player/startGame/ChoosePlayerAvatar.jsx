import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import Avatar from "../../avatars/Avatar";
import AllAvatars from "../../avatars/AllAvatars";
import { Button, Form } from "react-bootstrap";
import classNames from "classnames";
import shuffleSeed from "shuffle-seed";
import { useLocalStorageState } from "../../common/useLocalStorageState";
import { v4 as uuidv4 } from "uuid";
import Color from "color";
import dice64 from "./../../common/classAnimation/dice-64.png";
import { useClassAnimation } from "../../common/classAnimation/useClassAnimation";
import getAvatars from "./getAvatars";
import { useSignalR } from "../../signalr/useSignalR";

import "./ChoosePlayerAvatar.css";

const ChoosePlayerAvatar = ({ gameStateId, playerId, avatar, colors, onColorChange, onColorRemove, onAvatarSelect }) => {
  const [spinAnimation, setSpinAnimation] = useClassAnimation(250);
  const [flipAnimation, setFlipAnimation] = useClassAnimation(200);
  const [selectedAvatar, setSelectedAvatar] = useState(avatar);
  const [selectedAvatars, setSelectedAvatars] = useState([]);
  const selectedAvatarRef = useRef();
  const [startingColors, setStartingColors] = useState(colors);
  const [seed] = useLocalStorageState("seed", uuidv4());
  const colorPickerContainerRef = useRef();
  const shuffledAvatarsRef = useRef(shuffleSeed.shuffle(Object.keys(AllAvatars), seed));

  const avatarSelectOnClick = () => {
    onAvatarSelect(selectedAvatar);
  };

  const onSwapColors = () => {
    setFlipAnimation(true);
    setStartingColors([colors[1], colors[0]]);
  };

  const getNewColor = () => {
    return Color("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"));
  };

  const onRandomizeColors = () => {
    setSpinAnimation(true);

    if (colors.length === 1) {
      setStartingColors([getNewColor()]);
    } else {
      setStartingColors([getNewColor(), getNewColor()]);
    }
  };

  const onColorCountChange = (e) => {
    if (e.target.checked) {
      setStartingColors([colors[0], getNewColor()]);
    } else {
      setStartingColors([colors[0]]);
    }
  };

  const onClickAvatar = useCallback(
    (avatar) => {
      if (selectedAvatars?.find((selectedAvatar) => selectedAvatar.avatar === avatar && selectedAvatar.playerId !== playerId)) {
        return;
      }

      setSelectedAvatar(avatar);
    },
    [selectedAvatars, playerId]
  );

  useEffect(() => {
    if (selectedAvatars?.find((sa) => sa.avatar === selectedAvatar && sa.playerId !== playerId)) {
      setSelectedAvatar();
    }
  }, [selectedAvatars, selectedAvatar, playerId]);

  useEffect(() => {
    if (colors.length === 0) {
      setStartingColors([getNewColor()]);
    }
  }, [colors]);

  useEffect(() => {
    if (selectedAvatarRef.current) {
      selectedAvatarRef.current.scrollIntoView({ block: "center" });
    }
  }, [avatar]);

  useSignalR("Avatars", (sa) => {
    setSelectedAvatars(sa.avatars);
  });

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    getAvatars(gameStateId, (sa) => {
      if (sa) {
        setSelectedAvatars(sa.avatars);
      }
    });
  }, [gameStateId]);

  return (
    <>
      <div className="choosePlayerAvatarContainer">
        <div className="choosePlayerAvatarLabel">Choose your avatar</div>
        <div className="colorOptionsContainer">
          <div className="randomizeSwapContainer">
            <div className={classNames("randomizeContainer", { spinAnimation: spinAnimation })} onClick={onRandomizeColors}>
              <img src={dice64} alt="randomize"></img>
            </div>
            {colors?.length > 1 && (
              <div className={classNames("swapContainer flipAnimation", { flipAnimationFlipped: flipAnimation })} onClick={onSwapColors}>
                ⇄
              </div>
            )}
          </div>
          <div className="colorPickerContainer">
            <ColorPicker
              startingColors={startingColors}
              colors={colors}
              onColorChange={onColorChange}
              onColorRemove={onColorRemove}
              colorPickerContainerRef={colorPickerContainerRef}
            ></ColorPicker>
          </div>
          <div ref={colorPickerContainerRef} className="twoColorModeContainer">
            <div>Two Colors</div>
            <Form.Check type="switch" checked={colors && colors.length > 1} onChange={onColorCountChange} />
          </div>
        </div>

        <div className="playerAvatars">
          {shuffledAvatarsRef.current.map((avatarName) => {
            let isDisabled = selectedAvatars?.find((selectedAvatar) => selectedAvatar.avatar === avatarName && selectedAvatar.playerId !== playerId);
            return (
              <div
                key={avatarName}
                ref={avatarName === selectedAvatar ? selectedAvatarRef : null}
                className={classNames({ disabledAvatar: isDisabled })}
                onClick={() => onClickAvatar(avatarName)}
              >
                <Avatar
                  avatar={avatarName}
                  colors={isDisabled ? [Color("#333")] : colors}
                  className={classNames("avatarChoice", { selectedAvatar: avatarName === selectedAvatar })}
                ></Avatar>
              </div>
            );
          })}
        </div>
        <div className="playerAvatarNextButton">
          <Button onClick={avatarSelectOnClick} disabled={!selectedAvatar}>
            Looks Good
          </Button>
        </div>
      </div>
    </>
  );
};

export default ChoosePlayerAvatar;

ChoosePlayerAvatar.propTypes = {
  gameStateId: PropTypes.string,
  playerId: PropTypes.string,
  avatar: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.object),
  onColorChange: PropTypes.func.isRequired,
  onColorRemove: PropTypes.func.isRequired,
  onAvatarSelect: PropTypes.func.isRequired,
};
