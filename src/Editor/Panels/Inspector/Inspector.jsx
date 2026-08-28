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
import './_inspector.scss';
import './_inspectorselector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import InspectorTitle from './InspectorTitle/InspectorTitle';

import InspectorNumericSlider from './InspectorRow/InspectorRowTypes/InspectorNumericSlider';
import InspectorTextInput from './InspectorRow/InspectorRowTypes/InspectorTextInput';
import InspectorNumericInput from './InspectorRow/InspectorRowTypes/InspectorNumericInput';
import InspectorDualNumericInput from './InspectorRow/InspectorRowTypes/InspectorDualNumericInput';
import InspectorSelector from './InspectorRow/InspectorRowTypes/InspectorSelector';
import InspectorColorNumericInput from './InspectorRow/InspectorRowTypes/InspectorColorNumericInput';
import InspectorActionButton from './InspectorActionButton/InspectorActionButton';
import InspectorImagePreview from './InspectorPreview/InspectorPreviewTypes/InspectorImagePreview';
import InspectorSoundPreview from './InspectorPreview/InspectorPreviewTypes/InspectorSoundPreview';
import InspectorScriptWindow from './InspectorScriptWindow/InspectorScriptWindow';
import InspectorCheckbox from './InspectorRow/InspectorRowTypes/InspectorCheckbox';

class Inspector extends Component {
  constructor (props) {
    super(props);

    /**
     * Which render function should be used for each selection type?
     */
    this.inspectorContentRenderFunctions = {
      "frame": this.renderFrame,
      "layer": this.renderLayer,
      "multiframe": this.renderMultiFrame,
      "tween": this.renderTween,
      "multitween": this.renderMultiTween,
      "clip": this.renderClip,
      "button": this.renderButton,
      "path": this.renderPath,
      "text": this.renderText,
      "image": this.renderImage,
      "multipath": this.renderMultiPath,
      "multiclip": this.renderMultiClip,
      "multitimeline": this.renderMultiTimeline,
      "multicanvas": this.renderMultiCanvas,
      "imageasset": this.renderAsset,
      "soundasset": this.renderAsset,
      "multiassetmixed": this.renderAsset,
      "multisoundasset": this.renderAsset,
      "multiimageasset": this.renderAsset,
    }

    /**
     * Which actions should be shown for which selection types.
     */
    this.actionRules = {
      'breakApart': ["clip", "button",],
      'convertSelectionToButton': ["path", "text", "image", "multipath", "multiclip", "multicanvas"],
      'convertSelectionToClip': ["path", "text", "image", "multipath", "multiclip", "multicanvas"],
      'editTimeline': ["clip", "button"],
      'exportSelectedClip': ["clip"],
      'addAssetToCanvas': ["imageasset"],
    }

    /**
     * Which selection types have a translated title (see renderTitle / inspector.selectionTypes.*).
     */
    this.knownSelectionTypes = [
      "frame", "multiframe", "tween", "multitween", "clip", "button",
      "path", "text", "image", "multipath", "multiclip", "multitimeline",
      "multicanvas", "imageasset", "soundasset", "multiassetmixed",
      "multisoundasset", "multiimageasset", "unknown",
    ]
  }

  /**
   * Returns the value of a requested selection attribute.
   * @param  {string} attribute Selection attribute to retrieve.
   * @return {string|number|undefined} Value of the selection attribute to retrieve. Returns undefined is attribute does not exist.
   */
  getSelectionAttribute = (attribute) => {
    if (attribute === 'fillColorOpacity') {
      return this.getSelectionFillColorOpacity();
    }

    return this.props.getAllSelectionAttributes()[attribute];
  }

  /**
   * Returns the selection fill color opacity.
   * @return {string} fill color opacity from 0 to 1.
   */
  getSelectionFillColorOpacity = () => {
    let color = this.getSelectionAttribute('fillColor');
    if (color instanceof window.paper.Color && color.gradient) {
      let maxOpacity = color.gradient.stops.reduce((total, stop) => stop.color.alpha > total ? stop.color.alpha : total, 0);
      return maxOpacity;
    }
    return color.alpha;
  }

  /**
   * Sets the value of the selection fillColor opacity.
   * @param  {string} attribute Selection attribute to retrieve.
   */
  setSelectionFillColorOpacity = (value) => {
    var color = this.getSelectionAttribute('fillColor');
    if (color instanceof window.paper.Color && color.gradient) {
      let maxOpacity = color.gradient.stops.reduce((total, stop) => stop.color.alpha > total ? stop.color.alpha : total, 0);
      if (maxOpacity === 0) {
        color.gradient.stops.forEach(stop => {
          stop.color.alpha = value;
        });
      }
      else {
        let changeFactor = value / maxOpacity;
        color.gradient.stops.forEach(stop => {
          stop.color.alpha *= changeFactor;
        });
      }
    }
    else {
      color.alpha = value;
      this.setSelectionAttribute('fillColor', color);
    }
  }

  /**
   * Updates the value of a selection attribute for the selected item in the editor.
   * @param {string} attribute Name of the attribute to update.
   * @param {string|number} newValue  New value of the attribute to update.
   */
  setSelectionAttribute = (attribute, newValue) => {
    if (attribute === 'fillColorOpacity') {
      return this.setSelectionFillColorOpacity(newValue);
    }
    this.props.setSelectionAttribute(attribute, newValue);
  }

  setSelectionAttributeIntermediate = (attribute, newValue) => {
    if (attribute === 'fillColorOpacity') {
      return this.setSelectionFillColorOpacity(newValue);
    }
    this.props.project.selection[attribute] = newValue;
    this.props.project.view.render();
    this.props.project.guiElement.draw();
  }

  // Inspector Row Types

  /**
   * Renders an inspector row allowing viewing and editing of the selection stroke width.
   */
  renderSelectionStrokeWidth = () => {
    const { t } = this.props;
    return (
      <InspectorNumericSlider
        tooltip={t('inspector.tooltips.strokeWidth')}
        val={this.getSelectionAttribute('strokeWidth')}
        onChange={(val) => this.setSelectionAttribute('strokeWidth', val)}
        divider={false}
        inputProps={this.getSelectionInputProps('strokeWidth')}
        id="inspector-selection-stroke-width"/>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection fill color.
   */
  renderSelectionColor = () => {
    const { t } = this.props;
    return (
      <div className="inspector-item">
        <InspectorColorNumericInput
          tooltip1={t('inspector.tooltips.fill')}
          tooltip2={t('inspector.tooltips.opacity')}
          val1={this.getSelectionAttribute('fillColor')}
          onChange1={(col) => this.setSelectionAttribute('fillColor', col)}
          onChangeIntermediate1={(col) => this.setSelectionAttributeIntermediate('fillColor', col)}
          enableGradient={true}
          selectionProps={{
            getSelection: () => this.props.project.selection,
            renderSelection: () => this.props.project.view.render(),
            targetCanvas: this.props.project.view._svgCanvas
          }}
          id={"inspector-selection-fill-color"}
          val2={this.getSelectionAttribute('fillColorOpacity')}
          onChange2={(val) => this.setSelectionAttribute('fillColorOpacity', val)}
          divider={false}
          colorPickerType={this.props.colorPickerType}
          changeColorPickerType={this.props.changeColorPickerType}
          updateLastColors={this.props.updateLastColors}
          lastColorsUsed={this.props.lastColorsUsed}
        />
        <InspectorColorNumericInput
          tooltip1={t('inspector.tooltips.stroke')}
          tooltip2={t('inspector.tooltips.weight')}
          val1={this.getSelectionAttribute('strokeColor')}
          onChange1={(col) => this.setSelectionAttribute('strokeColor', col)}
          onChangeIntermediate1={(col) => this.setSelectionAttributeIntermediate('strokeColor', col)}
          enableGradient={true}
          selectionProps={{
            getSelection: () => this.props.project.selection,
            renderSelection: () => this.props.project.view.render(),
            targetCanvas: this.props.project.view._svgCanvas
          }}
          id={"inspector-selection-stroke-color"}
          stroke={true}
          val2={this.getSelectionAttribute('strokeWidth')}
          onChange2={(val) => this.setSelectionAttribute('strokeWidth', val)}
          divider={false}
          colorPickerType={this.props.colorPickerType}
          changeColorPickerType={this.props.changeColorPickerType}
          updateLastColors={this.props.updateLastColors}
          lastColorsUsed={this.props.lastColorsUsed}
        />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selected object's font.
   */
  renderFontFamily = () => {
    const { t } = this.props;
    let opts = this.props.fontInfoInterface.allFontNames;

    let getFontClass = (font) => {
      let fontClass = 'font-selector-' + font.split(" ").join("-");
      let existingClass = this.props.fontInfoInterface.isExistingFont(font) ? ' existing-font' : '';
      return fontClass + existingClass;
    };

    opts = opts.map(opt => {
      return {
        value: opt,
        label: opt,
        className: getFontClass(opt),
      }
    });

    return (
      <InspectorSelector
        className="font-family"
        value={this.getSelectionAttribute('fontFamily')}
        tooltip={t('inspector.tooltips.fontFamily')}
        type="select"
        isSearchable={true}
        options={opts}
        onChange={(val) => {
          let font = val.value;

          // Don't fetch the file if we already have it.
          if (this.props.fontInfoInterface.hasFont(val.value)) {
            this.setSelectionAttribute('fontFamily', font);
            return;
          }

          // Fetch the file if it's missing.
          this.props.fontInfoInterface.getFontFile({
            font: font,
            callback: blob => {
                var file = new File([blob], font+'.ttf', {type:'font/ttf'});
                this.props.importFileAsAsset(file, () => {
                  this.setSelectionAttribute('fontFamily', font)
                });
            },
            error: error => {
              console.error(error)
            }
          });

        }}>
        </InspectorSelector>
    )
  }

  renderFontStyle = () => {
    const { t } = this.props;
    let options = [
      {value: 'normal', label: t('inspector.options.fontStyleNormal')},
      {value: 'italic', label: t('inspector.options.fontStyleItalic')},
    ]
    return (
      <InspectorSelector
        tooltip={t('inspector.tooltips.style')}
        type="select"
        isSearchable={true}
        value={this.getSelectionAttribute('fontStyle')}
        options={options}
        onChange={(val) => {
          this.setSelectionAttribute('fontStyle', val.value);
        }} />
    )
  }

  renderFontWeight = () => {
    const { t } = this.props;
    let fontWeights = [
      {label: t('inspector.options.fontWeightThin'), value: 100},
      {label: t('inspector.options.fontWeightExtraLight'), value: 200},
      {label: t('inspector.options.fontWeightLight'), value: 300},
      {label: t('inspector.options.fontWeightNormal'), value: 400},
      {label: t('inspector.options.fontWeightMedium'), value: 500},
      {label: t('inspector.options.fontWeightSemiBold'), value: 600},
      {label: t('inspector.options.fontWeightBold'), value: 700},
      {label: t('inspector.options.fontWeightExtraBold'), value: 800},
      {label: t('inspector.options.fontWeightBlack'), value: 900},
    ];

    let weight = Math.min(Math.max(this.getSelectionAttribute('fontWeight'), 100), 900);

    return (
      <InspectorSelector
        tooltip={t('inspector.tooltips.weight')}
        type="select"
        isSearchable={true}
        value={weight}
        options={fontWeights}
        onChange={(val) => {
          let newWeight = val.value || 400;
          this.setSelectionAttribute('fontWeight', newWeight);
        }} />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection font size.
   */
  renderFontSize = () =>  {
    const { t } = this.props;
    return (
      <InspectorNumericInput
        tooltip={t('inspector.tooltips.fontSize')}
        val={this.getSelectionAttribute('fontSize')}
        onChange={(val) => this.setSelectionAttribute('fontSize', val)} />
    )
  }

  /**
   * Wick Engine — суто "рушійний" код без локалізації, тож новий шар
   * завжди отримує англійську назву за замовчуванням ("Layer", "Layer 2"
   * тощо), незалежно від обраної локалі. Для відображення в Інспекторі
   * перекладаємо саме цю дефолтну назву — тими самими ключами, якими вже
   * користується Органайзер (outliner.defaultLayerName /
   * outliner.defaultLayerNameNumbered) — а назву, яку користувач ввів
   * власноруч, лишаємо без змін.
   * @param {string} rawName - "сира" назва шару (layer.name).
   * @returns {string} назва, яку варто показати в полі вводу.
   */
  getDisplayedLayerName = (rawName) => {
    const { t } = this.props;

    if (rawName === null || rawName === undefined) return rawName;

    let defaultNameMatch = rawName.match(/^Layer(?: (\d+))?$/);
    if (!defaultNameMatch) return rawName;

    return defaultNameMatch[1]
      ? t('outliner.defaultLayerNameNumbered', { number: defaultNameMatch[1] })
      : t('outliner.defaultLayerName');
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's name.
   */
  renderName = () => {
    const { t } = this.props;
    let selectionType = this.props.getSelectionType();
    let name = this.getSelectionAttribute('name');
    if (selectionType === 'layer') {
      name = this.getDisplayedLayerName(name);
    }

    return (
      <div className="inspector-item">
        <InspectorTextInput
          tooltip={t('inspector.tooltips.name')}
          val={name}
          onChange={(val) => {this.setSelectionAttribute('name', val);}}
          placeholder={t('inspector.placeholders.noName')}
          id="inspector-name" />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing and editing of a selection's identifier
   */
  renderIdentifier = () => {
    const { t } = this.props;
    return (
      <div className="inspector-item">
        <InspectorTextInput
          tooltip={t('inspector.tooltips.name')}
          val={this.getSelectionAttribute('identifier')}
          onChange={(val) => {this.setSelectionAttribute('identifier', val);}}
          placeholder={t('inspector.placeholders.noName')}
          id="inspector-name" />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing of the selection's file name.
   */
  renderFilename = () => {
    const { t } = this.props;
    return (
      <div className="inspector-item">
        <InspectorTextInput
          tooltip={t('inspector.tooltips.file')}
          val={this.getSelectionAttribute('filename')}
          readOnly={true}
          id="inspector-file-name"/>
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing of the selection's src image.
   */
  renderAssetPreview = () => {
    let selectionType = this.props.getSelectionType();
    if(selectionType === 'imageasset') {
      return (
        <InspectorImagePreview
          src={this.getSelectionAttribute('src')}
          id="inspector-image-preview" />
      );
    } else if (selectionType === 'soundasset') {
      return (
        <InspectorSoundPreview
          src={this.getSelectionAttribute('src')}
          id="inspector-sound-preview" />
      );
    }
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's frame length.
   */
  renderFrameLength = () => {
    const { t } = this.props;
    return (
      <div className="inspector-item">
        <InspectorNumericInput
          tooltip={t('inspector.tooltips.length')}
          val={this.getSelectionAttribute('frameLength')}
          onChange={(val) => this.setSelectionAttribute('frameLength', val)}
          id="inspector-frame-length" />
      </div>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's x y position.
   */
  renderPosition = () => {
    const { t } = this.props;
    return (
      <InspectorDualNumericInput
        tooltip1={t('inspector.tooltips.originX')}
        tooltip2={t('inspector.tooltips.originY')}
        val1={this.getSelectionAttribute('originX')}
        val2={this.getSelectionAttribute('originY')}
        onChange1={(val) => this.setSelectionAttribute('originX', val)}
        onChange2={(val) => this.setSelectionAttribute('originY', val)}
        id="inspector-origin" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's origin x y position.
   */
  renderOrigin = () => {
    const { t } = this.props;
    return (
      <InspectorDualNumericInput
        tooltip1={t('inspector.tooltips.x')}
        tooltip2={t('inspector.tooltips.y')}
        val1={this.getSelectionAttribute('x')}
        val2={this.getSelectionAttribute('y')}
        onChange1={(val) => this.setSelectionAttribute('x', val)}
        onChange2={(val) => this.setSelectionAttribute('y', val)}
        id="inspector-position" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's width and height.
   */
  renderSize = () => {
    const { t } = this.props;
    return (
      <InspectorDualNumericInput
        tooltip1={t('inspector.tooltips.width')}
        tooltip2={t('inspector.tooltips.height')}
        val1={this.getSelectionAttribute('width')}
        val2={this.getSelectionAttribute('height')}
        onChange1={(val) => this.setSelectionAttribute('width', val)}
        onChange2={(val) => this.setSelectionAttribute('height', val)}
        id="inspector-size" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's scaleX and scaleY.
   */
  renderScale = () => {
    const { t } = this.props;
    return (
      <InspectorDualNumericInput
        tooltip1={t('inspector.tooltips.scaleW')}
        tooltip2={t('inspector.tooltips.scaleH')}
        val1={this.getSelectionAttribute('scaleX')}
        val2={this.getSelectionAttribute('scaleY')}
        onChange1={(val) => this.setSelectionAttribute('scaleX', val)}
        onChange2={(val) => this.setSelectionAttribute('scaleY', val)}
        id="inspector-scale" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's rotation.
   */
  renderRotation = () => {
    const { t } = this.props;
    return (
      <InspectorNumericInput
        tooltip={t('inspector.tooltips.rotation')}
        val={this.getSelectionAttribute('rotation')}
        onChange={(val) => this.setSelectionAttribute('rotation', val)}
        id="inspector-rotation" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's opacity.
   */
  renderOpacity = () => {
    const { t } = this.props;
    return (
      <InspectorNumericSlider
        tooltip={t('inspector.tooltips.opacity')}
        val={this.getSelectionAttribute('opacity')}
        onChange={(val) => this.setSelectionAttribute('opacity', val)}
        divider={false}
        inputProps={{min: 0, max: 1, step: 0.01}}
        id="inspector-opacity"/>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of all transformation properties
   * icluding position, scale, size, rotation and opacity.
   */
  renderSelectionTransformProperties = () => {
    return (
      <div className="inspector-item">
        {this.renderPosition()}
        {this.renderOrigin()}
        {this.renderSize()}
        {this.renderScale()}
        {this.renderRotation()}
        {this.renderOpacity()}
      </div>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of sound assets attached to the
   * current object.
   */
  renderSelectionSoundAsset = () => {
    const { t } = this.props;
    let options = [{
      value: null,
      label: t('inspector.options.noSound')
    }]

    let mapAsset = asset => {
      if (!asset) {
        return {
          value: "novalue",
          label: t('inspector.options.noSound'),
        }
      }
      return {
        value: asset,
        label: asset.name,
      }
    }

    options = options.concat(this.props.getAllSoundAssets().map(mapAsset));

    let value = this.getSelectionAttribute('sound');
    return (
      <InspectorSelector
        tooltip={t('inspector.tooltips.sound')}
        type="select"
        options={options}
        value={value}
        isSearchable={true}
        onChange={(val) => {this.setSelectionAttribute('sound', val.value)}} />
    );
  }

  renderSelectionSoundVolume = () => {
    const { t } = this.props;
    return (
      <InspectorNumericInput
        tooltip={t('inspector.tooltips.volume')}
        val={this.getSelectionAttribute('soundVolume')}
        onChange={(val) => {this.setSelectionAttribute('soundVolume', val)}}
        id="inspector-sound-volume" />
    )
  }

  renderSelectionSoundStart = () => {
    const { t } = this.props;
    return (
      <InspectorNumericInput
        tooltip={t('inspector.tooltips.startMs')}
        type="numeric"
        val={this.getSelectionAttribute('soundStart')}
        onChange={(val) => {this.setSelectionAttribute('soundStart', val)}} />
    )
  }

  renderSoundContent = () => {
    return (
      <div className="inspector-item">
        {this.renderSelectionSoundAsset()}
        {this.getSelectionAttribute('sound') && this.renderSelectionSoundVolume()}
        {this.getSelectionAttribute('sound') && this.renderSelectionSoundStart()}
      </div>
    )
  }

  renderAnimationType = () => {
    const { t } = this.props;
    return (
      <div className="inspector-item">
        <InspectorSelector
          tooltip={t('inspector.tooltips.animation')}
          type="select"
          options={this.props.getClipAnimationTypes()}
          value={this.getSelectionAttribute('animationType')}
          isSearchable={true}
          onChange={(val) => {this.setSelectionAttribute('animationType', val.value)}} />
          {
            this.getSelectionAttribute('singleFrameNumber') &&
            <InspectorNumericInput
            tooltip={t('inspector.tooltips.frame')}
            val={this.getSelectionAttribute('singleFrameNumber')}
            onChange={(val) => this.setSelectionAttribute('singleFrameNumber', val)} />
          }
        {this.getSelectionAttribute('animationType') !== "single" &&
        <InspectorCheckbox
          tooltip={t('inspector.tooltips.synced')} 
          checked={this.getSelectionAttribute('isSynced')}
          onChange={(val) => this.setSelectionAttribute('isSynced', !this.getSelectionAttribute('isSynced'))}/>}
      </div>
    )
  }

  renderTweenEasingType = () => {
    const { t } = this.props;
    let options = window.Wick.Tween.VALID_EASING_TYPES;
    let optionLabels = [];
    options.forEach((option) => {
      optionLabels.push({label: option, value: option});
    })
    return (
      <div className="inspector-item">
        <InspectorSelector
          tooltip={t('inspector.tooltips.easingType')}
          type="select"
          options={optionLabels}
          value={this.getSelectionAttribute('easingType')}
          isSearchable={true}
          onChange={(val) => {this.setSelectionAttribute('easingType', val.value)}} />
      </div>
    );
  }

  renderTweenFullRotations = () => {
    const { t } = this.props;
    return (
      <div className="inspector-item">
        <InspectorNumericInput
          tooltip={t('inspector.tooltips.fullRotations')}
          val={this.getSelectionAttribute('fullRotations')}
          onChange={(val) => this.setSelectionAttribute('fullRotations', val)}
          id="inspector-full-rotation" />
      </div>
    );
  }

  // Selection contents and properties

  /**
   * Renders the inspector view for all properties of a frame.
   */
  renderFrame = () => {
    return (
        <div className="inspector-content">
          {this.renderIdentifier()}
          {this.renderFrameLength()}
          {this.renderSoundContent()}
        </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a layer.
   */
  renderLayer = () => {
    return  (
      <div className="inspector-content">
        {this.renderName()}
      </div>
    )
  }

  /**
   * Renders the inspector view for all properties of a multi-frame selection.
   */
  renderMultiFrame = () => {
    return ( <div className="inspector-content" /> );
  }

  /**
   * Renders the inspector view for all properties of a multi-clip selection.
   */
  renderMultiClip = () => {
    return ( <div className="inspector-content" /> );
  }

  /**
   * Renders the inspector view for all properties of a tween selection.
   */
  renderTween = () =>  {
    return (
      <div className="inspector-content">
        {this.renderTweenEasingType()}
        {this.renderTweenFullRotations()}
      </div>
     );
  }

  /**
   * Renders the inspector view for all properties of a multi-tween selection.
   */
  renderMultiTween = () => {
    return ( <div className="inspector-content">
      {this.renderTweenEasingType()}
      {this.renderTweenFullRotations()}
    </div> );
  }

  /**
   * Renders the inspector view for all properties of a selection with group properties.
   */
  renderGroupContent = () => {
    return (
      <div className="inspector-content">
        {this.renderIdentifier()}
        {this.renderSelectionTransformProperties()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a group selection.
   */
  renderGroup = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a multi-group selection.
   */
  renderMultiGroup = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a clip selection.
   */
  renderClip = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a button selection.
   */
  renderButton = () => {
    return ( this.renderGroupContent() );
  }

  renderFontContent = () => {
    return (
      <div className="inspector-item">
        {this.renderFontFamily()}
        {this.renderFontStyle()}
        {this.renderFontWeight()}
        {this.renderFontSize()}
      </div>
    )
  }

  /**
   * Renders the inspector view for all properties of a selection with path properties.
   */
  renderPathContent = () => {
    return(
      <div className="inspector-content">
        {this.renderSelectionTransformProperties()}
        {this.renderSelectionColor()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a path selection.
   */
  renderPath = () => {
    return ( this.renderPathContent() );
  }

  /**
   * Renders the inspector view for all text properties.
   */
  renderText = () => {
    return (
      <div className="inspector-content">
        {this.renderIdentifier()}
        {this.renderSelectionTransformProperties()}
        {this.renderSelectionColor()}
        {this.renderFontContent()}
      </div>
    )
  }

  /**
   * Renders the inspector view for clip animation type.
   */
  renderAnimationSetting = () => {
    return (
      <div className="inspector-content">
        {this.renderAnimationType()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all image properties.
   */
  renderImage = () => {
    return (
      <div className="inspector-content">
        {this.renderSelectionTransformProperties()}
      </div>
    )
  }

  /**
   * Renders the inspector view for all properties of a multi-path selection.
   */
  renderMultiPath = () => {
    return (
      <div className="inspector-content">
        {this.renderSelectionTransformProperties()}
        {this.renderSelectionColor()}
        {this.getSelectionAttribute('fontFamily') && this.renderFontContent()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a multi-canvas selection.
   */
  renderMultiCanvas = () => {
    return ( this.renderSelectionTransformProperties() )
  }

  /**
   * Renders the inspector view for all properties of a multi-timeline selection.
   */
  renderMultiTimeline = () => {
    return (
      <div>
      </div>
    )
  }

  /**
   * Renders the inspector view for all properties of an asset selection.
   */
  renderAsset = () => {
    return (
      <div className="inspector-content">
        {this.renderName()}
        {this.renderFilename()}
        {this.renderAssetPreview()}
      </div>
    )
  }

  /**
   * Renders a default selection view with no properties.
   */
  renderUnknown = () => {
    return (
      <div>
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  /**
   * Renders the proper view for the given selection type.
   * @param   {string} selectionType A string representation of the selection to display.
   * @returns {Component} JSX component to render.
   */
  renderDisplay = (selectionType) => {
    let renderFunction = null;

    if (selectionType in this.inspectorContentRenderFunctions) {
      renderFunction = this.inspectorContentRenderFunctions[selectionType];
    } else {
      renderFunction = this.renderUnknown;
    }

    return (
      renderFunction()
    );
  }

  /**
   * Renders a single action button for a given editor action.
   * @param {object} btn editor action with action, icon, color, and tooltip text properties.
   * @param {number} i unique key to be applied to returned object.
   * @returns {Component} JSX component to render.
   */
  renderActionButton = (action, i) => {
    return (
      <div key={i} className="inspector-item">
        <InspectorActionButton
          action={action} />
      </div>
    );
  }

  /**
   * Renders all actions for the current selection.
   * @returns {Component} JSX component containing all the actions for the current selection.
   */
  renderActions = () => {
    let actions = [];
    let selectionType = this.props.getSelectionType();

    Object.keys(this.actionRules).forEach(action => {
        let actionList = this.actionRules[action];
        if (actionList.indexOf(selectionType) > -1) actions.push(action);
    });

    return(
      <div className="inspector-content">
        {actions.map((action, i) => {
            return this.renderActionButton(this.props.editorActions[action], i);
          })}
      </div>
    )
  }

  /**
   * Renders an edit script window if a script exists for the selected object.
   * @returns {Component} JSX component containing script window.
   */
  renderScripts = () => {
    return (
      <div className="inspector-item">
        <InspectorScriptWindow
          script={this.props.script}
          deleteScript={this.props.deleteScript}
          editScript={this.props.editScript}
          scriptInfoInterface={this.props.scriptInfoInterface}
        />
      </div>
    );
  }

  /**
   * Renders the inspector title for the current selection.
   * @param {string} selectionType selection type to return.
   */
  renderTitle = (selectionType) => {
    const { t } = this.props;
    if (this.knownSelectionTypes.indexOf(selectionType) === -1) selectionType = "unknown";

    return (
      <div className="inspector-title-container">
        <InspectorTitle
          type={selectionType}
          title={t('inspector.selectionTypes.' + selectionType, '')} />
      </div>
    );
  }

  render() {
    const { t } = this.props;
    let selectionType = this.props.getSelectionType();
    return(
      <div className="docked-pane inspector" aria-label={t('inspector.ariaLabel')}>
        {this.renderTitle(selectionType)}
        <div className="inspector-body">
          {this.renderDisplay(selectionType)}
          {this.renderActions()}
          {this.props.selectionIsScriptable() && this.renderScripts()}
          {selectionType === 'clip' && this.renderAnimationSetting()}
        </div>
      </div>
    )
  }
}

export default withTranslation()(Inspector)
