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
import WickModal from 'Editor/Modals/WickModal/WickModal';
import { Progress } from 'reactstrap';

import './_exportmedia.scss';

class ExportMedia extends Component {
  render() {
    const { t } = this.props;
    let renderName = this.props.project.name;
    let renderTypeLabel = this.props.renderType;

    if (this.props.renderType === "video") {
      renderName += ".mp4";
      renderTypeLabel = t('exportMedia.types.video');
    } else if (this.props.renderType === "gif") {
      renderName += ".gif";
      renderTypeLabel = t('exportMedia.types.gif');
    } else if (this.props.renderType === "image sequence") {
      renderName += t('exportMedia.asSequenceSuffix');
      renderTypeLabel = t('exportMedia.types.imageSequence');
    }

    return (
      <WickModal
        open={this.props.open}
        toggle={this.props.toggle}
        className="media-export-modal-body"
        overlayClassName="media-export-modal-overlay">
        <div id="media-export-modal-title">{t('exportMedia.exportingTitle', { type: renderTypeLabel })}</div>
        <div className="media-export-modal-content">
          <div id="media-export-modal-subtitle">{t('exportMedia.creatingSubtitle', { name: renderName })}</div>
          <Progress
            striped
            animated={!this.renderDone}
            color={this.renderDone ? 'success' : 'warning'}
            value={this.props.renderProgress}
          />
          <div id="media-export-modal-status-message">{this.props.renderStatusMessage}</div>
        </div>
      </WickModal>
    );
  }

  get renderDone () {
    return this.props.renderProgress === 100;
  }
}

export default withTranslation()(ExportMedia)
