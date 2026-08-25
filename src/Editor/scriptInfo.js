/*
Copyright 2020 WICKLETS LLC
This file is part of Wick Editor.
... (ліцензія)
*/
// Імпортуємо глобальний екземпляр i18next напряму з пакету
import i18next from 'i18next'; 

class ScriptInfoInterface extends Object {
/**
  * Returns an array of objects that represent all possible scripts that can be added.
  * @returns {object[]}
  */
 get scriptData() {
     let scriptData = [];
     for (let scriptType of Object.keys(this.scriptsByType)) {
         for (let scriptName of this.scriptsByType[scriptType]) {
             scriptData.push({
                 name: scriptName,
                 type: scriptType,
                 description: this.scriptDescriptions[scriptName],
             });
         }
     }
     return scriptData;
 }
 get scriptsByType() {
     return {
         'Mouse': ['mouseenter', 'mouseleave', 'mousehover', 'mousepressed', 'mousedown', 'mousereleased', 'mousedrag', 'mouseclick'],
         'Keyboard': ['keypressed', 'keyreleased', 'keydown'],
         'Timeline': ['default', 'load', 'update', 'unload'],
     }
 }
 sortScripts = (scriptA, scriptB) => {
     let typeA = this.getScriptType(scriptA.name);
     let typeB = this.getScriptType(scriptB.name);
     if (!typeA || !typeB) return 0;
     let indA = this.scriptsByType[typeA].indexOf(scriptA);
     let indB = this.scriptsByType[typeB].indexOf(scriptB);
     const spacer = {
         'Mouse': 100,
         'Keyboard': 200,
         'Timeline': 0
     }
     indA += spacer[typeA];
     indB += spacer[typeB];
     return indA - indB;
 }
 getScriptType = (name) => {
     let scriptsByType = this.scriptsByType;
     for (let scriptType of Object.keys(scriptsByType)) {
         if (scriptsByType[scriptType].indexOf(name) !== -1) {
             return scriptType
         }
     }
     return null;
 }
 get scriptTypeColors() {
     return {
         'Timeline': 'blue',
         'Mouse': 'green',
         'Keyboard': 'yellow',
     }
 }
 get scriptDescriptions() {
     return {
         'default': i18next.t('scriptInfo.descriptions.default'),
         'mouseclick': i18next.t('scriptInfo.descriptions.mouseclick'),
         'mousedown': i18next.t('scriptInfo.descriptions.mousedown'),
         'mousedrag': i18next.t('scriptInfo.descriptions.mousedrag'),
         'mouseenter': i18next.t('scriptInfo.descriptions.mouseenter'),
         'mousehover': i18next.t('scriptInfo.descriptions.mousehover'),
         'mouseleave': i18next.t('scriptInfo.descriptions.mouseleave'),
         'mousepressed': i18next.t('scriptInfo.descriptions.mousepressed'),
         'mousereleased': i18next.t('scriptInfo.descriptions.mousereleased'),
         'keypressed': i18next.t('scriptInfo.descriptions.keypressed'),
         'keyreleased': i18next.t('scriptInfo.descriptions.keyreleased'),
         'keydown': i18next.t('scriptInfo.descriptions.keydown'),
         'load': i18next.t('scriptInfo.descriptions.load'),
         'unload': i18next.t('scriptInfo.descriptions.unload'),
         'update': i18next.t('scriptInfo.descriptions.update'),
     }
 }
 get referenceItems() {
     return {
         'Timeline': this.timelineReference,
         'Object': this.objectReference,
         'Input': this.inputReference,
         'Project': this.projectReference,
         'Random': this.randomReference,
         'Sound': this.soundReference,
         'Event': this.eventReference,
     }
 }
 get timelineReference() {
     return (
         [
             { name: 'play', snippet: 'play()', description: i18next.t('scriptInfo.reference.timeline.play') },
             { name: 'stop', snippet: 'stop()', description: i18next.t('scriptInfo.reference.timeline.stop') },
             { name: 'gotoAndPlay', snippet: 'gotoAndPlay(1)', description: i18next.t('scriptInfo.reference.timeline.gotoAndPlay'), params: [{ name: 'frame', type: '{string|Number}' }] },
             { name: 'gotoAndStop', snippet: 'gotoAndStop(1)', description: i18next.t('scriptInfo.reference.timeline.gotoAndStop'), params: [{ name: 'frame', type: '{string|Number}' }] },
             { name: 'gotoNextFrame', snippet: 'gotoNextFrame()', description: i18next.t('scriptInfo.reference.timeline.gotoNextFrame') },
             { name: 'gotoPrevFrame', snippet: 'gotoPrevFrame()', description: i18next.t('scriptInfo.reference.timeline.gotoPrevFrame') }
         ]
     );
 }
 get objectReference() {
     return (
         [
             { name: 'x', snippet: 'this.x', description: i18next.t('scriptInfo.reference.object.x') },
             { name: 'y', snippet: 'this.y', description: i18next.t('scriptInfo.reference.object.y') },
             { name: 'width', snippet: 'this.width', description: i18next.t('scriptInfo.reference.object.width') },
             { name: 'height', snippet: 'this.height', description: i18next.t('scriptInfo.reference.object.height') },
             { name: 'scaleX', snippet: 'this.scaleX', description: i18next.t('scriptInfo.reference.object.scaleX') },
             { name: 'scaleY', snippet: 'this.scaleY', description: i18next.t('scriptInfo.reference.object.scaleY') },
             { name: 'rotation', snippet: 'this.rotation', description: i18next.t('scriptInfo.reference.object.rotation') },
             { name: 'opacity', snippet: 'this.opacity', description: i18next.t('scriptInfo.reference.object.opacity') },
             { name: 'currentFrameName', snippet: 'this.currentFrameName', description: i18next.t('scriptInfo.reference.object.currentFrameName') },
             { name: 'currentFrameNumber', snippet: 'this.currentFrameNumber', description: i18next.t('scriptInfo.reference.object.currentFrameNumber') },
             { name: 'parent', snippet: 'parent', description: i18next.t('scriptInfo.reference.object.parent') },
             { name: 'clone', snippet: 'this.clone()', description: i18next.t('scriptInfo.reference.object.clone') },
             { name: 'clones', snippet: 'this.clones', description: i18next.t('scriptInfo.reference.object.clones') },
             { name: 'remove', snippet: 'this.remove()', description: i18next.t('scriptInfo.reference.object.remove') },
             { name: 'setText', snippet: 'textName.setText("Text")', description: i18next.t('scriptInfo.reference.object.setText') },
             { name: 'hits', snippet: 'this.hits(that)', description: i18next.t('scriptInfo.reference.object.hits'), param: [{name: 'that', type: 'object'}], returns: [{type: 'object', description: i18next.t('scriptInfo.reference.object.hitsReturns')}] },
             { name: 'if (hits)', snippet: 'if (this.hits(that)) {\n //Do Something!\n}', description: i18next.t('scriptInfo.reference.object.ifHits'), param: [{name: 'that', type: 'object'}] },
         ]
     );
 }
 get soundReference() {
     return (
         [
             { name: 'playSound', snippet: 'playSound("sound.mp3")', description: i18next.t('scriptInfo.reference.sound.playSound') },
             { name: 'stopAllSounds', snippet: 'stopAllSounds()', description: i18next.t('scriptInfo.reference.sound.stopAllSounds') },
         ]
     )
 }
 get projectReference() {
     return (
         [
             { name: 'project.width', snippet: 'project.width', description: i18next.t('scriptInfo.reference.project.width') },
             { name: 'project.height', snippet: 'project.height', description: i18next.t('scriptInfo.reference.project.height') },
             { name: 'project.framerate', snippet: 'project.framerate', description: i18next.t('scriptInfo.reference.project.framerate') },
             { name: 'project.hitTestOptions', snippet: 'project.hitTestOptions', description: i18next.t('scriptInfo.reference.project.hitTestOptions') },
             { name: 'hitTestOptions', snippet: 'hitTestOptions({mode: "CIRCLE", offset: true, overlap: true, intersections: true})', description: i18next.t('scriptInfo.reference.project.hitTestOptionsFn'), param: [{name: 'that', type: 'object'}] },
         ]
     )
 }
 get randomReference() {
     return (
         [
             { name: 'random.integer', snippet: 'random.integer(1, 10)', description: i18next.t('scriptInfo.reference.random.integer') },
             { name: 'random.float', snippet: 'random.float(0, 1)', description: i18next.t('scriptInfo.reference.random.float') },
             { name: 'random.choice', snippet: 'random.choice(array)', description: i18next.t('scriptInfo.reference.random.choice') },
         ]
     )
 }
 get inputReference() {
     return (
         [
             { name: 'mouseX', snippet: 'mouseX', description: i18next.t('scriptInfo.reference.input.mouseX') },
             { name: 'mouseY', snippet: 'mouseY', description: i18next.t('scriptInfo.reference.input.mouseY') },
             { name: 'mouseMoveX', snippet: 'mouseMoveX', description: i18next.t('scriptInfo.reference.input.mouseMoveX') },
             { name: 'mouseMoveY', snippet: 'mouseMoveY', description: i18next.t('scriptInfo.reference.input.mouseMoveY') },
             { name: 'key', snippet: 'key', description: i18next.t('scriptInfo.reference.input.key') },
             { name: 'keys', snippet: 'keys', description: i18next.t('scriptInfo.reference.input.keys') },
             { name: 'isMouseDown', snippet: 'isMouseDown()', description: i18next.t('scriptInfo.reference.input.isMouseDown') },
             { name: 'isKeyDown', snippet: 'isKeyDown("a")', description: i18next.t('scriptInfo.reference.input.isKeyDown'), param: [{ name: 'key', type: '{string}' }], returns: [{ type: 'bool', description: i18next.t('scriptInfo.reference.input.isKeyDownReturns') }] },
             { name: 'isKeyJustPressed', snippet: 'isKeyJustPressed("a")', description: i18next.t('scriptInfo.reference.input.isKeyJustPressed'), param: [{ name: 'key', type: '{string}' }], returns: [{ type: 'bool', description: i18next.t('scriptInfo.reference.input.isKeyJustPressedReturns') }] },
             { name: 'if (key)', snippet: 'if (key === "a" ) {\n // Add your code here. \n}\n', description: i18next.t('scriptInfo.reference.input.ifKey') },
             { name: 'hideCursor', snippet: 'hideCursor()', description: i18next.t('scriptInfo.reference.input.hideCursor') },
             { name: 'showCursor', snippet: 'showCursor()', description: i18next.t('scriptInfo.reference.input.showCursor') },
         ]
     );
 }
 get eventReference() {
     let events = []
     let descriptions = this.scriptDescriptions;
     Object.keys(descriptions).forEach((key) => {
         if (key !== 'default') {
             events.push({
                 name: key,
                 snippet: "onEvent('<EVENT_FN>', function () {\n  //Add code here!\n});".replace('<EVENT_FN>', key),
                 description: descriptions[key],
             });
         }
     });
     return events;
 }
}
export default ScriptInfoInterface;
