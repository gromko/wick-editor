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
import './_menubar.scss';
import MenuBarButton from './MenuBarButton/MenuBarButton';
import MenuBarIconButton from './MenuBarIconButton/MenuBarIconButton';
import MenuBarSupportButton from './MenuBarSupportButton/MenuBarSupportButton';

class MenuBar extends Component {

  renderDesktop = () => {
    const { t } = this.props;
    return(
      <div className="docked-pane menu-bar" aria-label={t('menuBar.ariaLabel')}>
        <div className="menu-bar-info-container">
          <MenuBarIconButton
            id="tool-information-button"
            tooltip={t('menuBar.editorInfo')}
            action={() => this.props.openModal('EditorInfo')}
            icon="mascotmark"
            />

          <MenuBarSupportButton
            icon="wickworld"
            id="support-us-button"
            tooltip={t('menuBar.supportUs')}
            action={() => this.props.openModal('WelcomeMessage')}
            />
          </div>

        <div className="menu-bar-project-name" role="button" onClick={() => this.props.openModal("SimpleProjectSettings")}>
          {this.props.projectName}
        </div>

        <div className="menu-bar-actions-container">

          <MenuBarButton
            text={t('menuBar.new')}
            action={this.props.openNewProjectConfirmation}
          />

          <MenuBarButton
            text={t('menuBar.open')}
            action={this.props.openProjectFileDialog}
          />

          <MenuBarButton
            text={t('menuBar.export')}
            action={() => {this.props.exporting ? this.props.openExportMedia() : this.props.openExportOptions()}}
          />

          <MenuBarButton
            text={t('menuBar.save')}
            action={this.props.exportProjectAsWickFile}
            color='save'
          />

          <MenuBarIconButton
            icon="gear"
            action={() => this.props.openModal('SettingsModal')}
            tooltip={t('menuBar.editorSettings')}
            tooltipPlace="left"
            id="editor-settings-button" />
        </div>
      </div>
    )
  }

  renderMobile = () => {
    const { t } = this.props;
    return (
      <div className="docked-pane menu-bar">
        <MenuBarIconButton icon="hamburger" action={() => this.props.openModal('MobileMenuModal')}/>

        <MenuBarSupportButton
          icon="wickworld"
          id="support-us-button"
          tooltip={t('menuBar.supportUs')}
          action={() => this.props.openModal('WelcomeMessage')}
        />

        <div role="button" onClick={() => this.props.openModal("SimpleProjectSettings")} className="menu-bar-project-name-mobile">
          {this.props.projectName}
        </div>

        <div className="menu-bar-actions-container">
          <MenuBarButton
            text={t('menuBar.save')}
            action={this.props.exportProjectAsWickFile}
            color='save'
          />
        </div>
      </div>
    );
  }

  render() {
    if (this.props.renderSize === "small") {
      return this.renderMobile();
    }
    else {
      return this.renderDesktop();
    }
  }
}

export default withTranslation()(MenuBar);
