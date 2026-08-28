/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState, useCallback } from 'react';
import { Popover } from 'reactstrap';
import WickColorPicker from 'Editor/Util/ColorPicker/WickColorPicker';
import { CHECKERBOARD_URL } from 'Editor/Util/ColorPicker/ColorPickerComponents/ColorPickerComponents';

import './_colorpicker.scss';

export default function ColorPicker (props) {
  const [open, setOpen] = useState(false);
  let itemID = props.id;
  let popoverID = itemID+'-popover';

  function toggle () {
    if (!open) {
      setTimeout(selectPopover, 200);
    }
    setOpen(!open)
  }

  function selectPopover () {
    let ele = document.getElementById(popoverID);
    if (ele)
      ele.focus();
  }

  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  let color = props.color ? props.color : new window.Wick.Color("#FFFFFF")
  let colorCSS = color;
  let colorCSSOpaque = color;
  if (color instanceof window.paper.Color) {
    if (color.gradient) {
      colorCSS = colorCSSOpaque = 'linear-gradient(to right';

      const sortedControlStops = [...color.gradient.stops];
      sortedControlStops.sort((objectA, objectB) => objectA.offset - objectB.offset);
      sortedControlStops.forEach(paperControlStop => {
          colorCSS += `, ${paperControlStop.color.toCSS()} ${paperControlStop.offset * 100}%`;
          let { red, green, blue } = paperControlStop.color;
          colorCSSOpaque += `, rgb(${red*255},${green*255},${blue*255}) ${paperControlStop.offset * 100}%`;
      });
      colorCSS += ')';
      colorCSSOpaque += ')';
    }
    else {
      colorCSS = color.toCSS(); colorCSSOpaque = `rgb(${color.red*255},${color.green*255},${color.blue*255})`;
      colorCSS = `linear-gradient(${colorCSS}, ${colorCSS})`;
      colorCSSOpaque = `linear-gradient(${colorCSSOpaque}, ${colorCSSOpaque})`;
    }
  }
  else if (typeof color === 'string') {
    colorCSS = colorCSSOpaque = `linear-gradient(${color}, ${color})`;
    colorCSSOpaque = colorCSSOpaque.replaceAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/g, 'rgb($1, $2, $3)');
  }

  const [desyncedColor, setDesyncedColor] = useState(color);

  let selectionGiven = (typeof props.getSelection === 'function');
  let setGradientActive = (stopIndex) => {
    if (!selectionGiven) return;
    let selection = props.getSelection();

    if (stopIndex !== undefined && selection.useGradientGUI) return;
    selection.useGradientGUI = props.stroke ? 'stroke' : 'fill';
    selection.selectedStopIndex = stopIndex || 0;
    props.renderSelection();
  };
  let setGradientInactive = () => {
    if (!selectionGiven) return;
    let selection = props.getSelection();
    selection.useGradientGUI = false;
    selection.selectedStopIndex = 0;
    props.renderSelection();
  };
  let getSelectedStopIndex = () => selectionGiven && props.getSelection().selectedStopIndex;
  let setSelectedStopIndex = (index) => {
    if (!selectionGiven) return;
    props.getSelection().selectedStopIndex = index;
  };
  let selectedObjectsBounds = selectionGiven && props.getSelection().view._getSelectedObjectsBounds();

  return (
      <button
        className={"btn-color-picker" + (props.stroke ? " btn-color-picker-stroke" : "")}
        aria-label="color picker button"
        id={itemID}
        onClick={toggle}
        style={{
          backgroundImage: `${colorCSS}, ${CHECKERBOARD_URL}`,
          backgroundColor: 'white'
        }}>
          <div className="btn-color-picker-background-opaque"
            style={{ backgroundImage: colorCSSOpaque }} />
          <Popover
            tabIndex={-1}
            id={popoverID}
            placement={props.placement}
            isOpen={open}
            toggle={toggle}
            target={itemID}
            boundariesElement={'viewport'}
            onMouseDown={stopPropagation}
            onClick={stopPropagation}>
            <WickColorPicker
              toggle={toggle}
              colorPickerType={props.colorPickerType}
              changeColorPickerType={props.changeColorPickerType}
              disableAlpha={props.disableAlpha}
              enableGradient={props.enableGradient}

              color={color}
              desyncedColor={desyncedColor}
              onDesyncedChange={setDesyncedColor}
              onChangeComplete={props.onChangeComplete}
              onChangeIntermediate={props.onChangeIntermediate}

              selectedObjectsBounds={selectedObjectsBounds}
              setGradientActive={setGradientActive}
              setGradientInactive={setGradientInactive}
              getSelectedStopIndex={getSelectedStopIndex}
              setSelectedStopIndex={setSelectedStopIndex}

              lastColorsUsed={props.lastColorsUsed}
              updateLastColors={props.updateLastColors}
            />
          </Popover>
      </button>
  )
}
