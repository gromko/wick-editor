import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WickModal from 'Editor/Modals/WickModal/WickModal';
import WickInput from 'Editor/Util/WickInput/WickInput';

import './_simpleprojectsettings.scss';
import ActionButton from '../../Util/ActionButton/ActionButton';

export default function SimpleProjectSettings(props) {
  const { t } = useTranslation();
  const [newProjectName, setNewProjectName] = useState(props.project.name);
  const [newProjectFrameRate, setNewProjectFrameRate] = useState(props.project.framerate);
  const [newWidth, setNewWidth] = useState(props.project.width);
  const [newHeight, setNewHeight] = useState(props.project.height);

  useEffect(() => {
    resetProjectDetails();
  }, [props.open]);

  function resetProjectDetails() {
    setNewProjectName(props.project.name);
    setNewProjectFrameRate(props.project.framerate);
    setNewWidth(props.project.width);
    setNewHeight(props.project.height);
  }

  function updateProjectSettings() {
    props.updateProjectSettings({
      name: newProjectName,
      framerate: newProjectFrameRate,
      width: newWidth,
      height: newHeight
    });

    props.toggle();
  }

  return (
    <WickModal
      open={props.open}
      toggle={props.toggle}
      className="simple-settings-modal-container"
      overlayClassName="settings-modal-overlay">
      <h2 className="simple-settings-modal-title">{t('simpleProjectSettings.title')}</h2>
      <div className="simple-settings-modal-body">
        <div className="simple-settings-form-row">
          <label htmlFor="name" className="simple-settings-input-label">{t('projectSettings.name')}</label>
          <WickInput
            className="simple-settings-input"
            name="name"
            type="text"
            value={newProjectName}
            onChange={setNewProjectName} />
        </div>

        <div className="simple-settings-form-row">
          <label htmlFor="name" className="simple-settings-input-label">{t('projectSettings.framerateFps')}</label>
          <WickInput
            className="simple-settings-input"
            name="framerate"
            type="numeric"
            value={newProjectFrameRate}
            onChange={setNewProjectFrameRate} />
        </div>

        <div className="simple-settings-dual-form-row">
          <div className="simple-settings-dual-input">
            <label htmlFor="width" className="simple-settings-input-label">{t('simpleProjectSettings.width')}</label>
            <WickInput
              className="simple-settings-input"
              name="width"
              type="numeric"
              value={newWidth}
              min={1}
              max={5000}
              onChange={setNewWidth} />
          </div>
          <div className="simple-settings-dual-input">
            <label htmlFor="height" className="simple-settings-input-label">{t('simpleProjectSettings.height')}</label>
            <WickInput
              className="simple-settings-input"
              name="height"
              type="numeric"
              value={newHeight}
              min={1}
              max={5000}
              onChange={setNewHeight} />
          </div>

        </div>

      </div>
      <div className="simple-settings-modal-footer">
        <ActionButton
          className="simple-settings-action-button"
          text={t('projectSettings.cancel')}
          color="gray"
          action={resetProjectDetails} />
        <ActionButton
          className="simple-settings-action-button"
          text={t('projectSettings.apply')}
          color="green"
          action={updateProjectSettings} />
      </div>
    </WickModal>
  )
}