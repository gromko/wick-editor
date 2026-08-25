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
import ReactDOM from 'react-dom';
import './index.css';
import Editor from './Editor/Editor';
import * as serviceWorker from './serviceWorker';
import initializeDefaultFileHandlers from './files/filehandler';
//

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import uk from './locales/uk/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk },
    },
    lng: 'uk', // мова за замовчуванням, можна брати з localStorage/навігатора
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Синхронізуємо мову канвас-елементів (Wick.GUIElement.*) з мовою React-інтерфейсу.
// Wick.GUIElement.Locale — окрема, незалежна від i18next система локалізації
// (canvas не має доступу до React-дерева/хуків), тому її мову треба виставляти вручну.
if (window.Wick && window.Wick.GUIElement && window.Wick.GUIElement.Locale) {
  window.Wick.GUIElement.Locale.setLanguage(i18n.language);
}

i18n.on('languageChanged', (lng) => {
  if (window.Wick && window.Wick.GUIElement && window.Wick.GUIElement.Locale) {
    window.Wick.GUIElement.Locale.setLanguage(lng);
  }
});

export default i18n;

// Creates file handlers in the window.
initializeDefaultFileHandlers();

ReactDOM.render(<Editor />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
