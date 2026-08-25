/*
Copyright 2020 WICKLETS LLC
This file is part of Wick Editor.
... (ліцензія)
*/
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import './_editorsettings.scss';
import WickInput from 'Editor/Util/WickInput/WickInput';
import iconBackwards from 'resources/timeline-icons/backwards.svg';
import iconForwards from 'resources/timeline-icons/forwards.svg';

class EditorSettings extends Component {
  constructor () {
    super();
    this.state = {
    }
  }
  
  render () {
    const { t } = this.props;
    let optionsLabels = [];
    let options = this.props.getToolSettingRestrictions('onionSkinStyle').options;
    
    for (let i = 0; i < options.length; i++) {
      optionsLabels.push({label: options[i], value: options[i]});
    }

    const languageOptions = [
      { label: t('editorSettings.languageUkrainian'), value: 'uk' },
      { label: t('editorSettings.languageEnglish'), value: 'en' },
    ];
    
    return (
      <div className="editor-settings-modal-body">
        <div className="editor-settings-group">
          <label htmlFor="onion-skin-style" className="editor-settings-group-title">
            {t('editorSettings.onionSkinning')}
          </label>
          {t('editorSettings.style')}
          <WickInput
            type="select"
            id="onion-skin-style"
            value={this.props.getToolSetting('onionSkinStyle')}
            options={optionsLabels}
            onChange={(val) => {this.props.setToolSetting('onionSkinStyle', val.value)}}
          />
          {
            this.props.getToolSetting('onionSkinStyle') !== 'standard' &&
            <div className="editor-settings-row">
              {t('editorSettings.outlineColors')}
              <div className="editor-settings-color-containers-row">
                <div className="editor-settings-color-container">
                  <img className="forward-backward-icon" alt={t('editorSettings.backwardAlt')} src={iconBackwards}/>
                  <WickInput
                    type="color"
                    id="editor-settings-backward-color-picker"
                    disableAlpha={true}
                    placement={'bottom'}
                    color={this.props.getToolSetting('backwardOnionSkinTint').rgba}
                    onChange={(color) => {this.props.setToolSetting('backwardOnionSkinTint', new window.Wick.Color(color))}}
                    colorPickerType={this.props.colorPickerType}
                    changeColorPickerType={this.props.changeColorPickerType}
                    updateLastColors={this.props.updateLastColors}
                    lastColorsUsed={this.props.lastColorsUsed} 
                  />
                </div>
                <div className="editor-settings-color-container">
                  <img className="forward-backward-icon" alt={t('editorSettings.forwardAlt')} src={iconForwards}/>
                  <WickInput
                    type="color"
                    id="editor-settings-forward-color-picker"
                    disableAlpha={true}
                    placement={'bottom'}
                    color={this.props.getToolSetting('forwardOnionSkinTint').rgba}
                    onChange={(color) => {this.props.setToolSetting('forwardOnionSkinTint', new window.Wick.Color(color))}}
                    colorPickerType={this.props.colorPickerType}
                    changeColorPickerType={this.props.changeColorPickerType}
                    updateLastColors={this.props.updateLastColors}
                    lastColorsUsed={this.props.lastColorsUsed} 
                  />
                </div>
              </div>
            </div>
          }
        </div>

<div className="editor-settings-group editor-settings-language-group">
  <label htmlFor="editor-language" className="editor-settings-group-title">
    {t('editorSettings.language')}
  </label>
  <WickInput
    type="select"
    id="editor-language"
    value={this.props.i18n.language}
    options={languageOptions}
    onChange={(val) => {this.props.i18n.changeLanguage(val.value)}}
  />
</div>
      </div>
    )
  }
}

export default withTranslation()(EditorSettings);
