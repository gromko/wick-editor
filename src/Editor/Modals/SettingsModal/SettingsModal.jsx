/*
Copyright 2020 WICKLETS LLC
This file is part of Wick Editor.
... (ліцензія)
*/
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import WickModal from 'Editor/Modals/WickModal/WickModal';
import TabbedInterface from 'Editor/Util/TabbedInterface/TabbedInterface';
import ProjectSettings from './ProjectSettings/ProjectSettings';
import EditorSettings from './EditorSettings/EditorSettings';
import KeyboardShortcuts from './KeyboardShortcuts/KeyboardShortcuts';
import './_settingsmodal.scss';
var classNames = require("classnames");

class SettingsModal extends Component {
  renderProjectSettings = () => {
    return (
      <ProjectSettings
        project={this.props.project}
        updateProjectSettings={this.props.updateProjectSettings} />
    );
  }

  renderShortcuts = () => {
    return (
      <KeyboardShortcuts
        addCustomHotKeys={this.props.addCustomHotKeys}
        resetCustomHotKeys={this.props.resetCustomHotKeys}
        customHotKeys={this.props.customHotKeys}
        keyMap={this.props.keyMap} />
    )
  }

  renderDesktop = () => {
    const { t } = this.props;
    return (
      <WickModal
        open={this.props.open}
        toggle={this.props.toggle}
        className="settings-modal-container"
        overlayClassName="settings-modal-overlay" >
        <div className="settings-modal-title">
          {t('settingsModal.title')}
        </div>
        <div className="settings-modal-body">
          <TabbedInterface tabNames={[t('settingsModal.projectTab'), t('settingsModal.shortcutsTab'), t('settingsModal.editorTab')]} >
            <ProjectSettings
              project={this.props.project}
              updateProjectSettings={this.props.updateProjectSettings}
              colorPickerType={this.props.colorPickerType}
              changeColorPickerType={this.props.changeColorPickerType}
              updateLastColors={this.props.updateLastColors}
              toggle={this.props.toggle}
              lastColorsUsed={this.props.lastColorsUsed}/>
            <KeyboardShortcuts
              addCustomHotKeys={this.props.addCustomHotKeys}
              resetCustomHotKeys={this.props.resetCustomHotKeys}
              customHotKeys={this.props.customHotKeys}
              keyMap={this.props.keyMap}
              keyMapGroups={this.props.keyMapGroups}
              toast={this.props.toast}
              toggle={this.props.toggle}
              createCombinedHotKeyMap={this.props.createCombinedHotKeyMap}/>
            <EditorSettings
              colorPickerType={this.props.colorPickerType}
              changeColorPickerType={this.props.changeColorPickerType}
              updateLastColors={this.props.updateLastColors}
              lastColorsUsed={this.props.lastColorsUsed}
              getToolSetting={this.props.getToolSetting}
              setToolSetting={this.props.setToolSetting}
              toggle={this.props.toggle}
              getToolSettingRestrictions={this.props.getToolSettingRestrictions}/>
          </TabbedInterface>
        </div>
      </WickModal>
    );
  }

  renderMobile = () => {
    const { t } = this.props;
    return (
      <WickModal
        open={this.props.open}
        toggle={this.props.toggle}
        className={classNames("settings-modal-container", this.props.isMobile && "mobile")}
        overlayClassName="settings-modal-overlay" >
        <div className="settings-modal-title">
          {t('settingsModal.title')}
        </div>
        <div className="settings-modal-body">
          <TabbedInterface tabNames={[t('settingsModal.projectTab'), t('settingsModal.editorTab')]} >
            <ProjectSettings
              isMobile={true}
              project={this.props.project}
              updateProjectSettings={this.props.updateProjectSettings}
              colorPickerType={this.props.colorPickerType}
              changeColorPickerType={this.props.changeColorPickerType}
              updateLastColors={this.props.updateLastColors}
              lastColorsUsed={this.props.lastColorsUsed}/>
            <EditorSettings
              isMobile={true}
              colorPickerType={this.props.colorPickerType}
              changeColorPickerType={this.props.changeColorPickerType}
              updateLastColors={this.props.updateLastColors} 
              lastColorsUsed={this.props.lastColorsUsed}
              getToolSetting={this.props.getToolSetting}
              setToolSetting={this.props.setToolSetting}
              getToolSettingRestrictions={this.props.getToolSettingRestrictions}/>
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

export default withTranslation()(SettingsModal);
