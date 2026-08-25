/*
Copyright 2020 WICKLETS LLC
This file is part of Wick Editor.
... (ліцензія)
*/
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import WickModal from 'Editor/Modals/WickModal/WickModal';
import WickInput from 'Editor/Util/WickInput/WickInput';
import ObjectInfo from '../Util/ObjectInfo/ObjectInfo';
import './_makeinteractive.scss';

class MakeInteractive extends Component {
  constructor (props) {
    super(props);
    this.state = {
      name: "",
      makeAsset: true,
    }
  }

  /**
   Creates an item of type and toggles the modal.
   @param {string} type Either 'Button' or 'Clip'
  */
  createAndToggle = (type) => {
    let name = this.state.name !== "" ? this.state.name : (type);
    if (type === 'Clip') {
      this.props.createClipFromSelection(name)
    } else if (type === 'Button') {
      this.props.createButtonFromSelection(name);
    }
    this.props.toggle()
  }

  // Updates the clip name in the state.
  updateClipName = (newName) => {
    this.setState({
      name: newName,
    });
  }

  // Updates state value responsible for creating asset.
  updateAssetCheckbox = (val) => {
    this.setState({
      makeAsset: val,
    });
  }

  render() {
    const { t } = this.props;
    
    return (
      <WickModal
        open={this.props.open}
        toggle={this.props.toggle}
        className="make-interactive-modal-body"
        overlayClassName="make-interactive-modal-overlay" >
        <div id="make-interactive-modal-interior-content">
          <div id="make-interactive-modal-title">
            {t('makeInteractive.title')}
          </div>
          <div id="make-interactive-modal-name-input">
            <WickInput
              type="text"
              value={this.state.name}
              onChange={this.updateClipName}
              placeholder={t('makeInteractive.placeholderName')} />
          </div>
          <div className="make-interactive-object-info-container">
            <ObjectInfo
              title={t('makeInteractive.clipTitle')}
              rows={[
                {
                  text: t('makeInteractive.canAddAnyCode'),
                  icon: "check"
                },
                {
                  text: t('makeInteractive.clipOwnTimeline'),
                  icon: "check"
                },
                {
                  text: t('makeInteractive.clipControlTimeline'),
                  icon: "check",
                }
              ]} />
            <ObjectInfo
              title={t('makeInteractive.buttonTitle')}
              rows={[
                {
                  text: t('makeInteractive.canAddAnyCode'),
                  icon: "check"
                },
                {
                  text: t('makeInteractive.buttonOnly3Frames'),
                  icon: "check"
                },
                {
                  text: t('makeInteractive.buttonMouseInteractions'),
                  icon: "check",
                }
              ]} />
          </div>
        </div>
        <div id="make-interactive-modal-footer">
          <ActionButton
            className="make-interactive-modal-button"
            color='gray-green'
            action={() => { this.createAndToggle("Clip") }}
            text={t('makeInteractive.convertToClip')}
          />
          <ActionButton
            className="make-interactive-modal-button"
            color='gray-green'
            action={() => { this.createAndToggle("Button") }}
            text={t('makeInteractive.convertToButton')}
          />
        </div>
        <div id="make-interactive-asset-checkbox-container">
          {/*  
          <WickInput
            type="checkbox"
            containerclassname="make-interactive-asset-checkbox-input-container"
            className="make-interactive-asset-checkbox-input"
            onChange={this.updateAssetCheckbox}
            defaultChecked={this.state.makeAsset}
          />
          <div id="make-interactive-asset-checkbox-message">
            {t('makeInteractive.addToAssetLibrary')}
          </div> 
          */}
        </div>
      </WickModal>
    );
  }
}

export default withTranslation()(MakeInteractive);
