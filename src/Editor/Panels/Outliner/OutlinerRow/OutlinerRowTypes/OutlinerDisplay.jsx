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

import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import '../_outlinerrow.scss'

import OutlinerWidget from '../../OutlinerWidget/OutlinerWidget';

class OutlinerDisplay extends Component {
  render() {
    const { t } = this.props;
    const items = {path: "path-object",
      button: "button-object",
      clip: "clip-object",
      text: "text-object",
      image: "image-object"}; 
    
    return(
      <div className="outliner-row">
        {/* Identifier */}
        <span className="outliner-row-identifier">
          {this.props.tooltip}
        </span>
        {/* Input */}
        <span className="outliner-input-container">
          {Object.keys(items).map((item) => {
            return (
            <OutlinerWidget
              tooltip={t(
                this.props.display[item] ? 'outliner.widgets.hideObjects' : 'outliner.widgets.showObjects',
                { type: t('outliner.objectTypes.' + item) }
              )}
              key={item}
              onClick={() => {
                var newDisplay = {...this.props.display};
                newDisplay[item] = !newDisplay[item];
                this.props.onChange(newDisplay);
              }} 
              icon={items[item]}
              on={this.props.display[item]}
            />);
          })}
        </span>
      </div>
    )
  }
}

export default withTranslation()(OutlinerDisplay)
/*
renderDisplay = () => {
  
  return (
    <div className="wick-display-container">
      {Object.keys(items).map((item) => {
        let is_displayed = this.props.display[item] ? "true" : "false";
        
        return (
          <img 
            alt={item}
            src={items[item]}
            className={"wick-display-item " + is_displayed}
            onClick={() => {
              var newDisplay = {...this.props.display};
              newDisplay[item] = !newDisplay[item];
              this.props.onChange(newDisplay);
              }
            }
          />
        );
      })}
    </div>
  );
}

.wick-display-item {
  padding-right: 2px;
  width: 17px;
}
.false {
  opacity: 0.25;
}
.true {
  opacity: 1.0;
}*/