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
import WickModal from 'Editor/Modals/WickModal/WickModal';
import WickInput from 'Editor/Util/WickInput/WickInput';
import ObjectInfo from '../Util/ObjectInfo/ObjectInfo';
import TabbedInterface from 'Editor/Util/TabbedInterface/TabbedInterface';

import './_exportoptions.scss';

let classNames=require("classnames");

class ExportOptions extends Component {
  constructor (props) {
    super(props);
    this.placeholderName = this.props.t('exportOptions.filenamePlaceholder');
    this.state = {
      name: this.props.projectName || '',
      subTab: 'Animation',
      exportWidth: 1920,
      exportHeight: 1080,
      exportResolution: "1080p",
      blackBars: true,
      useAdvanced: false,
    }

    this.customSizeTag = "custom";

    // If size is not represented, default to "custom".
    this.advancedSizes = {
      "1080p": {
        width: 1920,
        height: 1080,
      },
      "720p": {
        width: 1080,
        height: 720,
      },
      "480p": {
        width: 720,
        height: 480
      }
    }
  }

  resetCustomSize = () => {
    this.setState({
      exportResolution: this.customSizeTag,
      exportWidth: 720,
      exportHeight: 405,
    });
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.projectName !== this.props.projectName) {
      this.setState({
          name: this.props.projectName,
        });
    }
  }

  /**
   * Creates an item of type and toggles the modal.
   * @param {string} type Either 'GIF', 'VIDEO', 'ZIP', or 'HTML'.
   */
  createAndToggle = (type) => {
    let name = this.state.name !== "" ? this.state.name : (type);

    let args = {
      name: name,
      width:  this.state.useAdvanced ? this.state.exportWidth : undefined,
      height: this.state.useAdvanced ? this.state.exportHeight : undefined,
    }

    if (type === 'GIF') {
      this.props.exportProjectAsGif(args);
    } else if (type === 'VIDEO') {
      this.props.exportProjectAsVideo(args);
    } else if (type === 'ZIP') {
      this.props.exportProjectAsStandaloneZip(args);
      this.props.toggle();
    } else if (type === 'HTML') {
      this.props.exportProjectAsStandaloneHTML(args);
      this.props.toggle();
    } else if (type === 'IMAGE_SEQUENCE') {
      this.props.exportProjectAsImageSequence(args);
    } else if (type === 'AUDIO_TRACK') {
      this.props.exportProjectAsAudioTrack(args);
      this.props.toggle();
    } else if (type === 'IMAGE_SVG') {
      this.props.exportProjectAsImageSVG(name);
      this.props.toggle();
      
    }
  }

  // Updates the clip name in the state.
  updateExportName = (newName) => {
    this.setState({
      name: newName,
    });
  }

  // Called by TabbedInterface when a tab is selected. Receives the
  // (translated) label plus its index, and maps the index back onto
  // the internal, untranslated type key used everywhere else in this
  // component (indexOf checks, className checks, etc.).
  setSubTab = (label, index) => {
    const type = (this.allowedExportTypes && this.allowedExportTypes[index]) || label;
    this.setState({
      subTab: type,
    });
  }

  toggleAdvancedOptionsCheckbox = () => {
    this.setState({
      useAdvanced: !this.state.useAdvanced,
    })
  }

  updateExportSize = (width, height) => {

    let res = this.customSizeTag;

    Object.keys(this.advancedSizes).forEach(key => {
      let size = this.advancedSizes[key];
      if (size.width === width && size.height === height) {
        res = key;
      }
    });

    this.setState({
      exportResolution: res,
      exportWidth: width,
      exportHeight: height,
    });
  }

  updateExportResolutionType = (val) => {
    let value = val.value;

    if (value === this.customSizeTag) {
      this.resetCustomSize();
    } else if (this.advancedSizes[value]) {
      let dimensions = this.advancedSizes[value];
      this.setState({
        exportResolution: value,
        exportWidth: dimensions.width,
        exportHeight: dimensions.height,
      });
    }
  }

  renderAdvancedOptions = () => {
    const { t } = this.props;
    let optionsValues = Object.keys(this.advancedSizes).concat([this.customSizeTag]);
    let options = optionsValues.map((val) => {return {label: val, value: val}});

    return (
      <div className="export-modal-advanced-options">
        <div className="export-modal-advanced-checkbox-container">
          <WickInput
            type="checkbox"
            checked={this.state.useAdvanced}
            onChange={this.toggleAdvancedOptionsCheckbox}
            label={t('exportOptions.resolutionOptions')}/>
        </div>
        {this.state.useAdvanced &&
          <div className="export-modal-advanced-options-content">

          {/* label is this because overwriting default library react-select */}


          <table>
            <tbody className="advanced-resolution-table">
              <tr>
                <td>
                  <label htmlFor="advanced-resolution-dropdown" className="export-modal-advanced-option-title">
                    {t('exportOptions.exportResolution')}
                  </label>
                </td>
                <td>

                </td>
                <td>

                </td>
              </tr>

              <tr>
                <td>
                </td>
                <td>
                  <label htmlFor="export-width" className="export-modal-resolution-label">
                    {t('exportOptions.widthPx')}
                  </label>
                </td>
                <td>
                  <label htmlFor="export-height" className="export-modal-resolution-label">
                    {t('exportOptions.heightPx')}
                  </label>
                </td>
              </tr>

              <tr>
                <td>
                <WickInput
                  id="advanced-resolution-dropdown"
                  inputProps={{id: "resolution"}}
                  type="select"
                  value={this.state.exportResolution}
                  options={options}
                  onChange={(val) => {this.updateExportResolutionType(val)}} />
                </td>
                <td>
                  <WickInput
                  id="export-width"
                  type="numeric"
                  value={this.state.exportWidth}
                  onChange={(val) => {this.updateExportSize(val, this.state.exportHeight)}}
                  />
                </td>
                <td>
                <WickInput
                  id="export-height"
                  type="numeric"
                  value={this.state.exportHeight}
                  onChange={(val) => {this.updateExportSize(this.state.exportWidth, val)}}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        }
      </div>
    )
  }

  renderGifObject = () => {
    const { t } = this.props;
    return (
      <div className={classNames("export-info-item", this.props.isMobile && "mobile")}>
        <ObjectInfo
          className="export-object-info"
          title={t('exportOptions.gif.title')}
          rows={[
            { text: t('exportOptions.gif.createsFile'), icon: "check" },
            { text: t('exportOptions.noSound'),          icon: "cancel" },
            { text: t('exportOptions.notInteractive'),   icon: "cancel" },
          ]} />
        <div className="export-modal-button-container">
          <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle("GIF") }}
            text={t('exportOptions.gif.exportButton')}
            />
        </div>
      </div>
    )
  }

  renderVideoObject = () => {
    const { t } = this.props;
    return (
      <div className={classNames("export-info-item", this.props.isMobile && "mobile")}>
        <ObjectInfo
          className="export-object-info"
          title={t('exportOptions.video.title')}
          rows={[
            { text: t('exportOptions.video.createsFile'), icon: "check" },
            { text: t('exportOptions.hasSound'),           icon: "check" },
            { text: t('exportOptions.notInteractive'),     icon: "cancel"},
          ]}/>
        <div className="export-modal-button-container">
          <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle("VIDEO") }}
            text={t('exportOptions.video.exportButton')}
            />
        </div>
      </div>
    )
  }

  renderStandaloneVideoObject = (componentFn) => {
    return (
      <div>
        {componentFn()}
        {this.renderAdvancedOptions()}
      </div>
    )
  }

  // Renders the body of the "Animation" tab.
  renderAnimatedInfo = () => {
    return (
      <div>
        <div className={classNames("export-info-container", this.props.isMobile && "mobile")}>
          {this.renderGifObject()}
          {this.renderVideoObject()}
        </div>
        {this.renderAdvancedOptions()}
      </div>

    );
  }

  // Renders the body of the "Interactive" tab.
  renderInteractiveInfo = () => {
    const { t } = this.props;
    return (
      <div className="export-info-container">
        <div className="export-info-item">
          <ObjectInfo
            className="export-object-info"
            title={t('exportOptions.zip.title')}
            rows={[
              { text: t('exportOptions.zip.fullyInteractive'),   icon: "check" },
              { text: t('exportOptions.zip.worksOnOtherSites'),  icon: "check" },
              { text: t('exportOptions.zip.createsFile'),        icon: "check" }
            ]}>
          </ObjectInfo>
          <div className="export-modal-button-container">
            <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle("ZIP") }}
            text={t('exportOptions.zip.exportButton')}
            />
          </div>
        </div>
        <div className="export-info-item">
          <ObjectInfo
            className="export-object-info"
            title={t('exportOptions.html.title')}
            rows={[
              { text: t('exportOptions.html.oneClickOpen'),      icon: "check" },
              { text: t('exportOptions.html.easilyShare'),       icon: "check" },
              { text: t('exportOptions.html.createsFile'),       icon: "check" }
            ]}>
          </ObjectInfo>
          <div className="export-modal-button-container">
            <ActionButton
              color='gray-green'
              action={() => { this.createAndToggle("HTML") }}
              text={t('exportOptions.html.exportButton')}
            />
          </div>
        </div>
      </div>
    );
  }

    // Renders the body of the "Animation" tab.
    renderImageInfo = () => {
      const { t } = this.props;
      return (
        <div>
          <div className={classNames("export-info-container", this.props.isMobile && "mobile")}>
            <div className={classNames("export-info-item", this.props.isMobile && "mobile")}>
              <ObjectInfo
                className="export-object-info"
                title={t('exportOptions.imageSequence.title')}
                rows={[
                  {
                    text: t('exportOptions.imageSequence.createsZip'),
                    icon: "check"
                  },
                  {
                    text: t('exportOptions.imageSequence.exportsPng'),
                    icon: "check",
                  },
                  {
                    text: t('exportOptions.notInteractive'),
                    icon: "cancel"
                  },
                ]} />
              <div className="export-modal-button-container">
              <ActionButton
                color='gray-green'
                action={() => { this.createAndToggle('IMAGE_SEQUENCE') }}
                text={t('exportOptions.imageSequence.exportButton')}
                />
              </div>
            </div>
            <div className={classNames("export-info-item", this.props.isMobile && "mobile")}>
              <ObjectInfo
                className="export-object-info"
                title={t('exportOptions.imageSvg.title')}
                rows={[
                  {
                    text: t('exportOptions.imageSvg.createsFile'),
                    icon: "check"
                  },
                  {
                    text: t('exportOptions.imageSvg.notAnimated'),
                    icon: "cancel",
                  },
                  {
                    text: t('exportOptions.notInteractive'),
                    icon: "cancel"
                  },
                ]} />
              <div className="export-modal-button-container">
              <ActionButton
                color='gray-green'
                action={() => { this.createAndToggle('IMAGE_SVG') }}
                text={t('exportOptions.imageSvg.exportButton')}
                />
              </div>
            </div>
          </div>
          {this.renderAdvancedOptions()}
        </div>
      );
    }

  renderAudioInfo () {
    const { t } = this.props;
    return (
      <div className="export-info-container">
        <div className="wide-export-info-item">
          <ObjectInfo
            className="export-object-info"
            title={t('exportOptions.audio.title')}
            rows={[
              {
                text: t('exportOptions.audio.createsWav'),
                icon: "check"
              },
              {
                text: t('exportOptions.notInteractive'),
                icon: "cancel"
              },
            ]} />
          <div className="export-modal-button-container">
          <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle('AUDIO_TRACK') }}
            text={t('exportOptions.audio.exportButton')}
            />
          </div>
        </div>
      </div>
    );
  }

  renderDesktop = () => {
    const { t } = this.props;
    window.allowedExportTypes = window.allowedExportTypes.sort((a, b) => {
      let order = ["Animation", "Interactive", "Audio", "Images"];

      return order.indexOf(a) - order.indexOf(b);
    });

    let allowedExportTypes = window.allowedExportTypes.concat([]);
    // Зберігаємо внутрішні (неперекладені) ключі, щоб TabbedInterface,
    // повертаючи індекс обраної вкладки, міг бути зіставлений назад
    // з правильним типом у setSubTab, незалежно від поточної мови.
    this.allowedExportTypes = allowedExportTypes;

    const tabLabels = {
      Animation: t('exportOptions.tabs.animation'),
      Interactive: t('exportOptions.tabs.interactive'),
      Audio: t('exportOptions.tabs.audio'),
      Images: t('exportOptions.tabs.images'),
    };

    let allowedExportTypeLabels = allowedExportTypes.map((type) => tabLabels[type] || type);

    return (
      <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      className={classNames("export-modal-body")}
      overlayClassName="export-modal-overlay">
        <div id="export-modal-interior-content">
          <div id="export-modal-title">{t('exportOptions.exportTitle')}</div>
          <div id="export-modal-name-input">
            <WickInput
              type="text"
              value={this.state.name}
              onChange={this.updateExportName}
              placeholder={this.placeholderName}
              aria-label={t('exportOptions.projectNameAriaLabel')} />
          </div>
          <TabbedInterface
            tabNames={allowedExportTypeLabels}
            onTabSelect={this.setSubTab}>
              { allowedExportTypes.indexOf('Animation') > -1 && this.renderAnimatedInfo()}
              { allowedExportTypes.indexOf('Interactive') > -1 && this.renderInteractiveInfo()}
              { allowedExportTypes.indexOf('Audio') > -1 && this.renderAudioInfo()}
              { allowedExportTypes.indexOf('Images') > -1 && this.renderImageInfo()}
          </TabbedInterface>
        </div>
      </WickModal>
    );
  }

  renderMobile = () => {
    const { t } = this.props;
    this.allowedExportTypes = ["GIF", "Video"];

    return (
      <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      className={classNames("export-modal-body", {"advanced-options": (this.state.useAdvanced && (this.state.subTab === "Animation" || this.state.subTab === "Images"))}, "mobile")}
      overlayClassName={classNames("export-modal-overlay", "mobile")}>
        <div id="export-modal-interior-content">
          <div id="export-modal-title">{t('exportOptions.exportTitle')}</div>
          <div id="export-modal-name-input">
            <WickInput
              type="text"
              value={this.state.name}
              onChange={this.updateExportName}
              placeholder={this.placeholderName}
              aria-label={t('exportOptions.projectNameAriaLabel')} />
          </div>
          <TabbedInterface
            tabNames={[t('exportOptions.gif.title'), t('exportOptions.video.title')]}
            onTabSelect={this.setSubTab}>
            {this.renderStandaloneVideoObject(this.renderGifObject)}
            {this.renderStandaloneVideoObject(this.renderVideoObject)}
          </TabbedInterface>
        </div>
      </WickModal>
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

export default withTranslation()(ExportOptions)
