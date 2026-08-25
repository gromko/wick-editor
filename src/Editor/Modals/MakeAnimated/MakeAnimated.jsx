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
import './_makeanimated.scss';

class MakeAnimated extends Component {
  constructor (props) {
    super(props);
    this.state = {
      name: "",
      makeAsset: true,
    }
  }

  // Creates a clip and toggles the modal.
  createAndToggle = () => {
    const { t } = this.props;
    let defaultName = t('makeAnimated.defaultName');
    let name = this.state.name !== "" ? this.state.name : defaultName;
    this.props.createClipFromSelection(name)
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
        className="make-animated-modal-body"
        overlayClassName="make-animated-modal-overlay" >
        <div id="make-animated-modal-interior-content">
          <div id="make-animated-modal-title">
            {t('makeAnimated.title')}
          </div>
          <div id="make-animated-modal-name-input">
            <WickInput
              type="text"
              value={this.state.name}
              onChange={this.updateClipName}
              placeholder={t('makeAnimated.placeholderName')} />
          </div>
          <ObjectInfo
            title={t('makeAnimated.clipTitle')}
            rows={[
              {
                text: t('makeAnimated.clipOwnTimeline'),
                icon: "check"
              },
              {
                text: t('makeAnimated.clipControlTimeline'),
                icon: "check"
              },
              {
                text: t('makeAnimated.canAddAnyCode'),
                icon: "check",
              }
            ]} />
        </div>
        <div id="make-animated-modal-footer">
          <div id="make-animated-modal-accept">
            <ActionButton
              className="make-animated-modal-button"
              color='gray-green'
              action={this.createAndToggle}
              text={t('makeAnimated.convertToClip')}
            />
          </div>
        </div>
        <div id="make-animated-asset-checkbox-container">
          {/*  
          <WickInput
            type="checkbox"
            containerclassname="make-animated-asset-checkbox-input-container"
            className="make-animated-asset-checkbox-input"
            onChange={this.updateAssetCheckbox}
            defaultChecked={this.state.makeAsset}
          />
          <div id="make-animated-asset-checkbox-message">
            {t('makeAnimated.addToAssetLibrary')}
          </div> 
          */}
        </div>
      </WickModal>
    );
  }
}

export default withTranslation()(MakeAnimated);
