import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import iro from "@jaames/iro";

const ColorPicker = ({ colors, onColorChange }) => {
  const colorPickerRef = useRef();

  useEffect(() => {
    if (!colors || colorPickerRef.current) {
      return;
    }

    colorPickerRef.current = new iro.ColorPicker("#colorPicker", {
      layout: [
        {
          component: iro.ui.Wheel,
          options: {},
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: "value",
          },
        },
      ],
      colors: colors,
      width: window.screen.width * 0.4,
      layoutDirection: "horizontal",
      borderWidth: 2,
    });

    colorPickerRef.current.on("color:change", function (color) {
      if (color.value < 25) {
        color.value = 25;
      }
      onColorChange(color.hexString, color.index);
    });
  }, [colors, onColorChange]);

  useEffect(() => {
    if (colorPickerRef.current && colors.length > 0) {
      if (colorPickerRef.current.colors.length < colors.length) {
        colorPickerRef.current.addColor(colors[1]);
      } else if (colorPickerRef.current.colors.length > colors.length) {
        colorPickerRef.current.removeColor(1);
      }
    }
  }, [colors]);

  return <div id="colorPicker" className="colorPicker"></div>;
};

export default ColorPicker;

ColorPicker.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  onColorChange: PropTypes.func.isRequired,
};
