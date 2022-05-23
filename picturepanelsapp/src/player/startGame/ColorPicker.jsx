import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import iro from "@jaames/iro";

const ColorPicker = ({ startingColors, colors, onColorChange, colorPickerContainerRef }) => {
  const colorPickerRef = useRef();

  useEffect(() => {
    if (!startingColors || colorPickerRef.current) {
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
      colors: startingColors,
      width: colorPickerContainerRef.current.getBoundingClientRect().width,
      // layoutDirection: "horizontal",
      borderWidth: 2,
      handleRadius: 10,
    });

    colorPickerRef.current.on(["color:init", "color:change"], function (color) {
      if (color.value < 25) {
        color.value = 25;
      }
      onColorChange(color.hexString, color.index);
    });
  }, [startingColors, onColorChange, colorPickerContainerRef]);

  useEffect(() => {
    if (colorPickerRef.current && startingColors) {
      colorPickerRef.current.setColors(startingColors);
    }
  }, [colorPickerRef, startingColors]);

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
  startingColors: PropTypes.arrayOf(PropTypes.string),
  colors: PropTypes.arrayOf(PropTypes.string),
  onColorChange: PropTypes.func.isRequired,
  colorPickerContainerRef: PropTypes.object.isRequired,
};
