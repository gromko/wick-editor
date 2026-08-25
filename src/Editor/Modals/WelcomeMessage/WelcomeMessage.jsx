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

import React from 'react';
import { useTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';
import WickModal from 'Editor/Modals/WickModal/WickModal';

import './_welcomemessage.scss';

import nightImageShort from 'resources/interface-images/blue_night_short.svg';
import coolField from 'resources/splash-screens/cool_field3.png';

var classNames = require('classnames');

export default function WelcomeMessage(props) {
  const { t } = useTranslation();

  return (
    <WickModal
      open={props.open}
      toggle={props.toggle}
      className={classNames('modal-body', 'welcome-modal-body', { 'welcome-modal-mobile-body': props.isMobile })}
      overlayClassName="modal-overlay welcome-modal-overlay">
      <div id="welcome-modal-interior-content">
        <div id="welcome-image-container" className="welcome-modal-main-container">
          <img
            id="welcome-image"
            alt="Night sky with mountains, clouds, a moon and stars"
            src={props.isMobile ? nightImageShort : coolField} />
        </div>

        <div id="welcome-message-container" className="modal-main-container">
          <div id="welcome-modal-title" className="welcome-modal-item">{t('welcomeMessage.title')}</div>

          <div id="welcome-modal-message" className="welcome-modal-item">
            <p>{t('welcomeMessage.paragraph1')}</p>
            <p>{t('welcomeMessage.paragraph2')}</p>
            <p>{t('welcomeMessage.createdBy')}</p>
          </div>
        </div>
      </div>
    </WickModal>
  );
}
