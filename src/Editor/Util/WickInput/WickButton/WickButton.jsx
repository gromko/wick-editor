import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';

let classNames = require('classnames');

/**
 * Wick Button
 * 
 * Double Click Rules
 * Will always perform the single click action. 
 * Will perform the secondary action on a double click within 500 ms.
 * 
 * @param {*} props 
 */
export default function WickButton(props) {

  const [clicked, setClicked] = useState(false);

  /**
   * Initiates a delayed action, and fires double click if it exists. 
   */
  function handleClick() {
    if (props.secondaryAction) {
      if (clicked) { // doubleclick
        props.secondaryAction();
        setClicked(false);
      } else {
        // Do the Action.
        props.onClick && props.onClick();
        setClicked(true);

        // Prepare for double clicks.
        setTimeout(() => {
          setClicked(false);
        }, 500);
      }
    } else {
      props.onClick && props.onClick();
    }
  }

  /**
   * Prevents the browser from giving this button focus on a mouse click,
   * so no focus outline/box-shadow lingers after the mouse leaves the
   * button. Keyboard (Tab) navigation is unaffected, since that doesn't
   * go through mousedown - so keyboard users still get focus styling.
   *
   * We do this instead of focusing then immediately calling blur(), because
   * a forced blur() with no relatedTarget looks like "focus left the
   * document/popover entirely" to any focus-out listeners up the tree
   * (e.g. reactstrap's Popover), which can cause the popover to close
   * unexpectedly right when a button inside it is clicked.
   */
  function handleMouseDown(e) {
    e.preventDefault();
  }

  return (
    <button
      {...props.buttonProps}
      onTouchStart={isMobile ? handleClick : undefined}
      onMouseDown={isMobile ? undefined : handleMouseDown}
      onClick={isMobile ? undefined : handleClick}
      className={classNames("wick-button ", props.className)}>
      {props.children}
    </button>
  )
}
