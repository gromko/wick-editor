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
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import WickInput from 'Editor/Util/WickInput/WickInput';

import './_projectsettings.scss';

var classNames = require('classnames');

class ProjectSettings extends Component {
  constructor(props) {
    super(props);

    this.defaultName = this.props.t('projectSettings.defaultName');

    // Set minimums for project settings.
    // TODO: Add this to the engine.
    this.projectMinWidth = 1;
    this.projectMinHeight = 1;
    this.projectMinFramerate = 1;

    // Create presets.
    // "id" is a stable, language-independent key used for comparisons and
    // translation lookups. The displayed label is resolved via t() at render time.
    this.presets = [
      {
        id: "default",
        width: 720,
        height: 480
      },
      {
        id: "square",
        width: 600,
        height: 600
      },
      {
        id: "hd720",
        width: 1280,
        height: 720
      },
      {
        id: "hd1080",
        width: 1920,
        height: 1080
      }
    ]

    this.state = {
      name: this.props.project.name,
      width: this.props.project.width,
      height: this.props.project.height,
      framerate: this.props.project.framerate,
      backgroundColor: this.props.project.backgroundColor.rgba,
      preset: this.getPreset(this.props.project.width, this.props.project.height),
    }
  }

  componentDidUpdate = (prevProps) => {
    let values = ['name', 'width', 'height', 'framerate', 'backgroundColor'];
    let different = false;
    values.forEach((value) => {
      if (prevProps.project[value] !== this.props.project[value]) {
        different = true;
      }
    });

    if (different) {
      this.reset();
    }
  }

  getPreset = (width, height) => {
    let possiblePreset = this.presets.find(preset => preset.width === width);
    if (possiblePreset && possiblePreset.height === height) {
      return possiblePreset.id;
    } else {
      return "custom";
    }
  }

  getPresetLabel = (presetId) => {
    return this.props.t(`projectSettings.presetNames.${presetId}`);
  }

  setPreset = (width, height) => {
    this.setState({
      preset: this.getPreset(width, height)
    });
  }

  changeProjectName = (proposedName) => {
    this.setState({
      name: proposedName,
    });
  }

  changeProjectWidth = (widthAsNumber) => {
    let cleanWidthAsNumber = (!widthAsNumber) ? this.projectMinWidth : Math.max(this.projectMinWidth, widthAsNumber);
    this.setState({
      width: cleanWidthAsNumber,
    });

    this.setPreset(cleanWidthAsNumber, this.state.height);
  }

  changeProjectHeight = (heightAsNumber) => {
    let cleanHeightAsNumber = (!heightAsNumber) ? this.projectMinHeight : Math.max(this.projectMinHeight, heightAsNumber);
    this.setState({
      height: cleanHeightAsNumber,
    });

    this.setPreset(this.state.width, cleanHeightAsNumber);
  }

  changeProjectFramerate = (framerateAsNumber) => {
    let cleanFramerateAsNumber = (!framerateAsNumber) ? this.projectMinFramerate : Math.max(this.projectMinFramerate, framerateAsNumber);
    this.setState({
      framerate: cleanFramerateAsNumber
    });
  }

  changeProjectBackgroundColor = (color) => {
    this.setState({
      backgroundColor: color,
    });
  }

  acceptProjectSettings = () => {
    let newSettings = {
      name: this.state.name === '' ? this.defaultName : this.state.name,
      width: this.state.width,
      height: this.state.height,
      backgroundColor: new window.Wick.Color(this.state.backgroundColor),
      framerate: this.state.framerate,
    }

    this.props.updateProjectSettings(newSettings);
    this.props.toggle && this.props.toggle();
  }

  reset = () => {
    this.setState({
      name: this.props.project.name,
      width: this.props.project.width,
      height: this.props.project.height,
      framerate: this.props.project.framerate,
      backgroundColor: this.props.project.backgroundColor.rgba,
      preset: this.getPreset(this.props.project.width, this.props.project.height)
    });
  }

  resetAndToggle = () => {
    this.reset();
    if (this.props.toggle) this.props.toggle();
  }

  renderNameObject = () => {
    const { t } = this.props;
    return (
      <div className={classNames("project-setting-element", this.props.isMobile && "mobile")}>
        <label htmlFor="project name" className="project-settings-property-label">
          {t('projectSettings.name')}
        </label>
        <div className="project-settings-property-container">
          <WickInput
              id="project name"
              type="text"
              value={this.state.name}
              placeholder={this.defaultName}
              onChange={this.changeProjectName}
            />
        </div>
      </div>
    );
  }

  renderFramerateObject = () => {
    const { t } = this.props;
    return (
      <div className={classNames("project-setting-element", this.props.isMobile && "mobile")}>
        <label htmlFor="project framerate" className="project-settings-property-label">
        {t('projectSettings.framerateFps')}
        </label>
        <div className="project-settings-property-container">
          <WickInput
          id="project framerate"
          type="numeric"
          min={this.projectMinFramerate}
          value={this.state.framerate}
          onChange={this.changeProjectFramerate} />
        </div>
      </div>
    );
  }
  
  renderWidthObject = () => {
    const { t } = this.props;
    return (
      <div className={classNames("project-setting-element", this.props.isMobile && "mobile")}>
        <div className="project-settings-property-container project-settings-size-input-container">
          <span>
            <label htmlFor="project width" className="project-settings-property-label">
              {t('projectSettings.widthPx')}
            </label>
            <WickInput
            id="project width"
            type="numeric"
            min={this.projectMinWidth}
            value={this.state.width}
            onChange = {this.changeProjectWidth}
            className="project-settings-size-input" 
            />
          </span>
          <span><div className="project-settings-split">x</div></span>
          <span>
            <label htmlFor="project height" className="project-settings-property-label">
              {t('projectSettings.heightPx')}
            </label>
            <WickInput
              id="project height"
              type="numeric"
              min={this.projectMinHeight}
              value={this.state.height}
              onChange={this.changeProjectHeight}
              className="project-settings-size-input" 
            />
          </span>
        </div>
      </div>
    );
  }

  renderSizeObjectMobile = () => {
    const { t } = this.props;
    return (
      <div className={classNames("project-setting-element", "mobile")}>
        <div className="project-settings-property-container project-settings-size-input-container mobile">
          <label htmlFor="projectWidth" className="project-settings-property-label mobile-size">
            {t('projectSettings.widthPx')}
          </label>
          <WickInput
            id="projectWidth"
            type="numeric"
            min={this.projectMinWidth}
            value={this.state.width}
            onChange = {this.changeProjectWidth}
            className="project-settings-size-input" />
        </div>
        <div className="project-settings-property-container project-settings-size-input-container mobile">
          <label htmlFor="projectHeight" className="project-settings-property-label mobile-size">
            {t('projectSettings.heightPx')}
          </label>
          <WickInput
            id="projectHeight"
            type="numeric"
            min={this.projectMinHeight}
            value={this.state.height}
            onChange={this.changeProjectHeight}
            className="project-settings-size-input" />
        </div>
      </div>
    );
  }

  renderBackgroundColorObject = () => {
    const { t } = this.props;
    return (
      <div className={classNames("project-setting-element", this.props.isMobile && "mobile")}>
        <label htmlFor="project-background-color-picker" className="project-settings-property-label">
          {t('projectSettings.backgroundColor')}
        </label>
        <div className="project-settings-property-container">
          <WickInput
            type="color"
            id="project-background-color-picker"
            disableAlpha={true}
            placement={'bottom'}
            color={this.state.backgroundColor}
            onChange={this.changeProjectBackgroundColor}
            colorPickerType={this.props.colorPickerType}
            changeColorPickerType={this.props.changeColorPickerType}
            updateLastColors={this.props.updateLastColors}
            lastColorsUsed={this.props.lastColorsUsed} />
        </div>
      </div>
    );
  }

  selectPreset = (preset) => {
    this.setState({
      width: preset.width,
      height: preset.height,
      preset: preset.id,
    });
  }

  renderPresetBoxes = () => {
    return (
      <div className="preset-boxes">
        {this.presets.map((preset,i) => {
          return (
            <ActionButton
            buttonProps={{"aria-labelledby": "resolution-presets"}}
            key={"preset" + i}
            className="project-settings-modal-preset"
            text={this.getPresetLabel(preset.id)}
            textClassName={classNames("project-settings-modal-preset-text", this.state.preset === preset.id && "selected")}
            color={this.state.preset === preset.id ? "green" : "tool"} 
            action={() => this.selectPreset(preset)}/>
          );
        })}
      </div>
    );
  }

  renderPresets = () => {
    const { t } = this.props;
    return (
      <div className="project-setting-element project-settings-presets-container">
        <label id="resolution-presets" className="project-settings-property-label">
          {t('projectSettings.presets')}
        </label>
        <div className="project-settings-presets-body-container">
          {this.renderPresetBoxes()}
        </div>
      </div>
    )
  }

  renderPresetsMobile = () => {
    const { t } = this.props;
    let options = [];
    for (let i = 0; i < this.presets.length; i++) {
      options.push({value: this.presets[i].id, label: this.getPresetLabel(this.presets[i].id)});
    }
    return (
      <div className="project-setting-element project-settings-presets-container">
        <div className="project-settings-property-label">
          {t('projectSettings.presets')}
        </div>
        <div className="project-settings-presets-body-container">
          <WickInput 
            type="select"
            value={this.state.preset}
            onChange={(option) => this.selectPreset(this.presets.find(preset => option.value === preset.id))}
            options={options}
          />
        </div>
      </div>
    );
  }

  renderSizeObject = () => {
    const { t } = this.props;
    return (
      <div className={classNames("project-setting-element", this.props.isMobile && "mobile")}>
        <div className="project-settings-property-container project-settings-size-input-container">
          <span>
            <label htmlFor="project width" className="project-settings-property-label">
              {t('projectSettings.widthPx')}
            </label>
            <WickInput
            id="project width"
            type="numeric"
            min={this.projectMinWidth}
            value={this.state.width}
            onChange = {this.changeProjectWidth}
            className="project-settings-size-input" 
            />
          </span>
          <span><div className="project-settings-split">x</div></span>
          <span>
            <label htmlFor="project height" className="project-settings-property-label">
              {t('projectSettings.heightPx')}
            </label>
            <WickInput
              id="project height"
              type="numeric"
              min={this.projectMinHeight}
              value={this.state.height}
              onChange={this.changeProjectHeight}
              className="project-settings-size-input" 
            />
          </span>
        </div>
      </div>
    );
  }

  renderDesktop = () => {
    const { t } = this.props;
    return (
        <div id="project-settings-interior-content">
          {/* Body */}
          <div id="project-settings-modal-body">
            <div className="project-settings-modal-row">
              {this.renderNameObject()}
              {this.renderBackgroundColorObject()}
            </div>
            <div className="project-settings-modal-row">
              {this.renderSizeObject()}
              {this.renderFramerateObject()}
            </div>
            <div className="project-settings-modal-row">
              {this.renderPresets()}
            </div>
          </div>
          {/* Footer */}
          <div id="project-settings-modal-footer">
            <div className="project-settings-modal-cancel">
                <ActionButton
                  className="project-settings-modal-button"
                  color='gray'
                  action={this.resetAndToggle}
                  text={t('projectSettings.cancel')}
                  />
              </div>
              <div className="project-settings-modal-accept">
                <ActionButton
                  className="project-settings-modal-button"
                  color='green'
                  action={this.acceptProjectSettings}
                  text={t('projectSettings.apply')}
                  />
              </div>
          </div>
        </div>
    );
  }

  renderMobile = () => {
    const { t } = this.props;
    return (
      <div id="project-settings-interior-content">
        {/* Body */}
        <div id="project-settings-modal-body">
          <div className="project-settings-modal-row">
            {this.renderNameObject()}
          </div>
          <div className="project-settings-modal-row">
            {this.renderBackgroundColorObject()}
          </div>
          <div className="project-settings-modal-row">
            {this.renderFramerateObject()}
          </div>
          <div className="project-settings-modal-row">
            {this.renderPresetsMobile()}
          </div>
          <div className="project-settings-modal-row">
            {this.renderSizeObjectMobile()}
          </div>
        </div>
        {/* Footer */}
        <div id="project-settings-modal-footer">
          <div className="project-settings-modal-cancel mobile">
            <ActionButton
              className="project-settings-modal-button"
              color='gray'
              action={this.resetAndToggle}
              text={t('projectSettings.cancel')}
            />
          </div>
          <div className="project-settings-modal-accept mobile">
            <ActionButton
              className="project-settings-modal-button"
              color='green'
              action={this.acceptProjectSettings}
              text={t('projectSettings.apply')}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.isMobile) {
      return this.renderMobile();
    }
    else {
      return this.renderDesktop();
    }
  }
}

export default withTranslation()(ProjectSettings)
