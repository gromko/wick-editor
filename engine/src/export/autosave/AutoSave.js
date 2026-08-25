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
 * Utility class for autosaving projects.
 */
Wick.AutoSave = class {
    /**
     * The key used to store the list of autosaved projects.
     * @type {string}
     */
    static get AUTOSAVES_LIST_KEY () {
        return 'autosaveList';
    }

    /**
     * The prefix to use for keys to save project autosave data.
     * @type {string}
     */
    static get AUTOSAVE_DATA_PREFIX () {
        return 'autosave_';
    }

    /**
     * Saves a given project to localforage.
     * @param {Wick.Project} project - the project to store in the AutoSave system.
     */
    static save (project, callback) {
        if(Wick.AutoSave.ENABLE_PERF_TIMERS) console.time('serialize step')
        var autosaveData = this.generateAutosaveData(project);
        if(Wick.AutoSave.ENABLE_PERF_TIMERS) console.timeEnd('serialize step')

        // Порожній проєкт (без жодного намальованого контуру чи
        // розміщеного символу) не має сенсу зберігати в автозбереженні —
        // і, відповідно, пропонувати користувачу для відновлення при
        // запуску редактора.
        //
        // ВАЖЛИВО: тут ми лише ПРОПУСКАЄМО запис, і ніколи нічого не
        // видаляємо. Перевірка isAutosaveDataEmpty — евристична (за
        // відомими нам класами вмісту), і якщо вона колись помилково
        // спрацює на непорожньому проєкті, видалення знищило б реальні
        // дані користувача. Пропуск запису натомість нешкідливий: попередній
        // (коректний) автозбережений стан цього проєкту просто лишиться в
        // сховищі, а не перезапишеться скиданням стану.
        if (this.isAutosaveDataEmpty(autosaveData)) {
            callback();
            return;
        }

        if(Wick.AutoSave.ENABLE_PERF_TIMERS) console.time('localforage step')
        this.addAutosaveToList(autosaveData, () => {
            this.writeAutosaveData(autosaveData, () => {
                if(Wick.AutoSave.ENABLE_PERF_TIMERS) console.timeEnd('localforage step')
                callback();
            })
        });
    }

    /**
     * Перевіряє, чи згенеровані дані автозбереження відповідають
     * "порожньому" проєкту — тобто проєкту без жодного об'єкта вмісту
     * (намальованого контуру, розміщеного кліпу чи кнопки). Структурні
     * об'єкти (Layer, Frame, Timeline тощо) присутні навіть у щойно
     * створеному проєкті, тому їх наявність емптіність не спростовує.
     * @param {Object} autosaveData - дані, згенеровані generateAutosaveData.
     * @returns {boolean} true, якщо серед об'єктів немає жодного вмісту.
     */
    static isAutosaveDataEmpty (autosaveData) {
        return !autosaveData.objectsData.some(objectData => {
            return Wick.AutoSave.CONTENT_CLASSNAMES.indexOf(objectData.classname) !== -1;
        });
    }

    /**
     * Loads a given project from localforage.
     * @param {string} uuid - the UUID of the project to load from the AutoSave system.
     * @param {function} callback
     */
    static load (uuid, callback) {
        this.readAutosaveData(uuid, autosaveData => {
            this.generateProjectFromAutosaveData(autosaveData, project => {
                callback(project);
            })
        });
    }

    /**
     * Deletes a project with a given UUID in the autosaves.
     * @param {string} uuid - uuid of project ot delete.
     * @param {function} callback
     */
    static delete (uuid, callback) {
        this.removeAutosaveFromList(uuid, () => {
            this.deleteAutosaveData(uuid, () => {
                callback();
            });
        });
    }

    /**
     * Generates an object that is writable to localforage from a project.
     * @param {Wick.Project} project - The project to generate data for.
     */
    static generateAutosaveData (project) {
        if(Wick.AutoSave.ENABLE_PERF_TIMERS) console.time('generate objects list')
        var objects = Wick.ObjectCache.getActiveObjects(project);
        if(Wick.AutoSave.ENABLE_PERF_TIMERS) console.timeEnd('generate objects list')

        if(Wick.AutoSave.ENABLE_PERF_TIMERS) console.time('serialize objects list')
        var projectData = project.serialize();
        var objectsData = objects.map(object => {
            return object.serialize();
        });
        if(Wick.AutoSave.ENABLE_PERF_TIMERS) console.timeEnd('serialize objects list')
        var lastModified = projectData.metadata.lastModified;

        return {
            projectData: projectData,
            objectsData: objectsData,
            lastModified: lastModified,
        };
    }

    /**
     * Creates a project from data loaded from the autosave system
     * @param {object} autosaveData - An autosave data object, use generateAutosaveData/readAutosaveData to get this object
     */
static generateProjectFromAutosaveData (autosaveData, callback) {
  // Deserialize all objects in the project so they are added to the ObjectCache.
  //
  // NOTE: order here does not matter. Wick.Base getters (e.g. frame.paths,
  // timeline.layers) resolve children lazily from Wick.ObjectCache by UUID
  // at access time, not eagerly during fromData(). So objects can be
  // deserialized in any order as long as they all end up in the cache
  // before the project is actually used/rendered.
  autosaveData.objectsData.forEach(objectData => {
    var object = Wick.Base.fromData(objectData);
  });

  // Deserialize the project itself
  var project = Wick.Base.fromData(autosaveData.projectData);

  // Load source files for assets from localforage
  Wick.FileCache.loadFilesFromLocalforage(project, () => {
    project.loadAssets(() => {
      callback(project);
    });
  });
}

    /**
     * Adds autosaved project data to the list of autosaved projects.
     * @param {Object} projectData -
     */
    static addAutosaveToList (autosaveData, callback) {
        this.getAutosavesList((list) => {
            // Remove any existing entry for this project so we don't
            // accumulate duplicate rows every time autosave runs.
            list = list.filter(item => {
                return item.uuid !== autosaveData.projectData.uuid;
            });

            list.push({
                uuid: autosaveData.projectData.uuid,
                lastModified: autosaveData.lastModified,
            });
            this.updateAutosavesList(list, () => {
                callback();
            })
        });
    }

    /**
     * Removes autosaved project data to the list of autosaved projects.
     * @param {string} uuid -
     */
    static removeAutosaveFromList (uuid, callback) {
        this.getAutosavesList((list) => {
            list = list.filter(item => {
                return item.uuid !== uuid;
            })
            this.updateAutosavesList(list, () => {
                callback();
            })
        });
    }

    /**
     * Get the list of autosaved projects currently in the AutoSave system.
     * @param {function} callback - function to be passed object containing all autosaved projects.
     */
    static getAutosavesList (callback) {
        localforage.getItem(this.AUTOSAVES_LIST_KEY).then(result => {
            var projectList = result || [];

            // Sort by lastModified
            projectList.sort((a,b) => {
                return b.lastModified - a.lastModified;
            });

            callback(projectList);
        });
    }

    /**
     * Отримує список автозбережень, відфільтрований від порожніх
     * проєктів (без Path/Clip/Button), — саме цей список слід
     * використовувати, щоб вирішити, чи є що пропонувати користувачу
     * для відновлення при запуску редактора. Запис у "сирому" списку
     * (getAutosavesList) сам по собі не гарантує, що збережені дані
     * дійсно містять вміст: це вже могло статись раніше через баг,
     * ручне втручання в localforage тощо, тож перевіряємо фактичний
     * вміст кожного запису.
     * @param {function} callback - отримує відфільтрований і
     * відсортований (за lastModified, спаданням) список автозбережень.
     */
    static getNonEmptyAutosavesList (callback) {
        this.getAutosavesList(list => {
            if (list.length === 0) {
                callback(list);
                return;
            }

            var nonEmptyList = [];
            var checked = 0;

            list.forEach(item => {
                this.readAutosaveData(item.uuid, autosaveData => {
                    if (autosaveData && !this.isAutosaveDataEmpty(autosaveData)) {
                        nonEmptyList.push(item);
                    }

                    checked++;
                    if (checked === list.length) {
                        // readAutosaveData виконуються паралельно, тож
                        // порядок відповідей не гарантований — відсортуємо
                        // ще раз за lastModified, як і в getAutosavesList.
                        nonEmptyList.sort((a, b) => {
                            return b.lastModified - a.lastModified;
                        });
                        callback(nonEmptyList);
                    }
                });
            });
        });
    }

    /**
     * Updates the list of autosaved projects currently in the AutoSave system.
     * @param {Object} autosaveList - the list of projects
     * @param {function} callback - called when saving is finished
     */
    static updateAutosavesList (autosaveList, callback) {
        localforage.setItem(this.AUTOSAVES_LIST_KEY, autosaveList).then(result => {
            callback();
        });
    }

    /**
     * Save project data into the autosave system.
     * @param {Object} autosaveData - Autosave data of a project, use generateAutosaveData to create this object
     */
    static writeAutosaveData (autosaveData, callback) {
        localforage.setItem(this.AUTOSAVE_DATA_PREFIX + autosaveData.projectData.uuid, autosaveData).then(() => {
            callback();
        });
    }

    /**
     * Load project data from the autosave system.
     * @param {string} uuid - the UUID of the project to load
     */
    static readAutosaveData (uuid, callback) {
        localforage.getItem(this.AUTOSAVE_DATA_PREFIX + uuid).then(result => {
            if(!result) {
                console.error('Could not load autosaveData for project: ' + uuid);
            }
            callback(result);
        });
    }

    /**
     * Deletes project data from the autosave system.
     * @param {string} uuid - the UUID of the project to delete
     */
    static deleteAutosaveData (uuid, callback) {
        localforage.removeItem(this.AUTOSAVE_DATA_PREFIX + uuid).then(() => {
            callback();
        });
    }
}

Wick.AutoSave.ENABLE_PERF_TIMERS = false;

/**
 * Назви класів (classname у серіалізованих об'єктах), наявність яких
 * означає, що проєкт містить реальний вміст, а не є порожнім.
 * За потреби доповніть цей список іншими типами вмісту.
 * @type {string[]}
 */
Wick.AutoSave.CONTENT_CLASSNAMES = ['Path', 'Clip', 'Button'];
