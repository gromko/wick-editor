/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * A minimal, standalone localization layer for the canvas-based GUI elements
 * in Wick Engine (Wick.GUIElement.*). This is intentionally decoupled from
 * react-i18next, since GUIElement classes render to <canvas> and have no
 * access to the React component tree, props, or hooks.
 *
 * All translated strings for every language live in a single
 * messages.js file per language (assigned onto Wick.GUIElement.Locale._rawMessages
 * at load time, since this build (Gulp + plain <script> concat) does not
 * support ES module `import` of JSON):
 *   locales/en/messages.js
 *   locales/uk/messages.js
 * Within each file, strings are grouped by component under a namespace key
 * (e.g. "actionButtonsContainer", "popupMenu") to avoid collisions between
 * unrelated components that might otherwise want the same short key (e.g.
 * two different components both wanting a "small" tooltip).
 *
 * Components reference their strings with a namespaced key, in the form
 * 'namespace.key', for example 'actionButtonsContainer.delete' or
 * 'popupMenu.small' — matching the nesting in messages.js. Components do
 * NOT need to import or register anything themselves; they only need to
 * pass the right namespaced key string to Wick.GUIElement.Locale.t().
 *
 * Adding a new language: add a new locales/<lng>/messages.js file (same
 * nested shape as the others, assigning onto _rawMessages.<lng>) and add
 * its path to gulpfile.js, right after this file.
 *
 * The React editor (Wick Editor) is responsible for keeping
 * Wick.GUIElement.Locale.language in sync with its own i18next language,
 * typically by calling Wick.GUIElement.Locale.setLanguage(lng) whenever
 * i18next's language changes (see i18n.on('languageChanged', ...)).
 */

Wick.GUIElement.Locale = class {
    /**
     * All translated strings, keyed by language code. Each value is the
     * full nested messages object for that language, populated by the
     * locales/<lng>/messages.js files (see gulpfile.js — they must be
     * concatenated in AFTER this file).
     * @private
     */
    static get _messages () {
        return Wick.GUIElement.Locale._rawMessages || {};
    }

    /**
     * The current language code (defaults to 'en'). Set this from the
     * React editor to keep the canvas GUI in sync with the rest of the UI.
     */
    static get language () {
        return Wick.GUIElement.Locale._language || 'en';
    }

    /**
     * Changes the active language for all GUIElement canvas text.
     * Tooltips resolve their translation at draw time (see Tooltip.js),
     * so no explicit redraw is required for tooltips specifically, though
     * one may still be useful for other, statically-drawn text.
     * @param {string} lng - Language code (e.g. 'en', 'uk').
     */
    static setLanguage (lng) {
        Wick.GUIElement.Locale._language = lng;
    }

    /**
     * Translates a namespaced string key (e.g. 'actionButtonsContainer.delete')
     * into the current language. Falls back to English, then to the key
     * itself, if no translation is found or the key isn't namespaced.
     * @param {string} key - The namespaced string key to translate.
     * @return {string} The translated string.
     */
    static t (key) {
        if (typeof key !== 'string') return key;

        var separatorIndex = key.indexOf('.');
        if (separatorIndex === -1) return key;

        var namespace = key.slice(0, separatorIndex);
        var stringKey = key.slice(separatorIndex + 1);

        var lng = Wick.GUIElement.Locale.language;
        var messages = Wick.GUIElement.Locale._messages;

        var translated = messages[lng]
            && messages[lng][namespace]
            && messages[lng][namespace][stringKey];
        if (translated !== undefined) return translated;

        var fallback = messages.en
            && messages.en[namespace]
            && messages.en[namespace][stringKey];
        if (fallback !== undefined) return fallback;

        return key;
    }
};
