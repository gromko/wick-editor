/**
 * Maps actions to editor core functions for use throughout the editor.
 * @extends Object
 */
class ActionMapInterface extends Object {
  /**
   * @param {Editor} editor - The editor instance whose methods actions call.
   * @param {function} t - The i18next `t` translation function (from
   *   react-i18next's withTranslation HOC on the owning Editor component).
   *   Tooltip text is resolved fresh from `t` every time `editorActions`
   *   is accessed (see the `editorActions` getter below), so tooltips stay
   *   correct if the interface language changes after this class is
   *   constructed — they are NOT baked in once and cached.
   */
  constructor(editor, t) {
    super();
    this.editor = editor;
    this.t = t;

    this.createEditorActionDefinitions();
  }

  /**
   * Creates the underlying action definitions for use around the editor.
   * Each definition must include a {function} action and a {string} id
   * representing a unique id. Optional properties include a {string}
   * color, {string} icon, and {string} tooltipKey — a translation key
   * under the "actionMap" namespace (see locales/en/translation.json and
   * locales/uk/translation.json), resolved to display text on access via
   * the `editorActions` getter, not stored here directly.
   */
  createEditorActionDefinitions () {
    this._editorActionDefinitions =  {
      flipHorizontal: {
        icon: 'flipHorizontal',
        tooltipKey: 'actionMap.flipHorizontal',
        action: this.editor.flipSelectedHorizontal,
        id: 'action-flip-horizontal',
      },
      flipVertical: {
        icon: 'flipVertical',
        tooltipKey: 'actionMap.flipVertical',
        action: this.editor.flipSelectedVertical,
        id: 'action-flip-vertical',
      },
      sendToBack: {
        icon: 'sendToBack',
        tooltipKey: 'actionMap.sendToBack',
        action: this.editor.sendSelectionToBack,
        id: 'action-send-to-back',
      },
      sendToFront: {
        icon: 'bringToFront',
        tooltipKey: 'actionMap.sendToFront',
        action: this.editor.sendSelectionToFront,
        id: 'action-send-to-front',
      },
      sendBackward: {
        icon: 'sendBackwards',
        tooltipKey: 'actionMap.sendBackward',
        action: this.editor.moveSelectionBackwards,
        id: 'action-move-backward',
      },
      sendForward: {
        icon: 'bringForwards',
        tooltipKey: 'actionMap.sendForward',
        action: this.editor.moveSelectionForwards,
        id: 'action-move-forward',
      },
      booleanUnite: {
        icon: 'unite',
        tooltipKey: 'actionMap.booleanUnite',
        action: this.editor.booleanUnite,
        id: 'action-boolean-unite',
      },
      booleanSubtract: {
        icon: 'subtract',
        tooltipKey: 'actionMap.booleanSubtract',
        action: this.editor.booleanSubtract,
        id: 'action-boolean-subtract',
      },
      booleanIntersect: {
        icon: 'intersect',
        tooltipKey: 'actionMap.booleanIntersect',
        action: this.editor.booleanIntersect,
        id: 'action-boolean-intersect',
      },
      createGroupFromSelection: {
        icon: 'createGroup',
        tooltipKey: 'actionMap.createGroupFromSelection',
        action: () => console.error('NYI'),
        id: 'action-create-group',
      },
      editCode: {
        icon: 'script',
        tooltipKey: 'actionMap.editCode',
        action: this.editor.toggleCodeEditor,
        id: 'action-toggle-code-editor',
      },
      editTimeline: {
        icon: 'timeline-dark',
        tooltipKey: 'actionMap.editTimeline',
        action: this.editor.focusTimelineOfSelectedObject,
        id: 'action-edit-timeline',
        color: 'active-green'
      },
      exportSelectedClip: {
        icon: 'save',
        tooltipKey: 'actionMap.exportSelectedClip',
        action: this.editor.exportSelectedClip,
        id: 'action-export-selected-clip',
        color: 'active-green'
      },
      breakApart: {
        icon: 'breakApart-dark',
        tooltipKey: 'actionMap.breakApart',
        action: this.editor.breakApartSelection,
        id: 'action-break-apart',
      },
      addTweenToSelection: {
        icon: 'addTween',
        tooltipKey: 'actionMap.addTweenToSelection',
        action: () => console.error('NYI'),
        id: 'action-add-tween',
      },
      makeAnimated: {
        icon: 'animated',
        tooltipKey: 'actionMap.makeAnimated',
        action: this.editor.beginMakeAnimatedProcess,
        id: 'action-make-animated',
      },
      makeInteractive: {
        icon: 'symbol',
        tooltipKey: 'actionMap.makeInteractive',
        action: this.editor.beginMakeInteractiveProcess,
        id: 'action-make-interactive',
      },
      returnToParentTimeline: {
        icon: 'leaveUp',
        tooltipKey: 'actionMap.returnToParentTimeline',
        action: this.editor.focusTimelineOfParentClip,
        id: 'action-return-to-parent-timeline',
      },
      undo: {
        icon: 'undo',
        tooltipKey: 'actionMap.undo',
        action: this.editor.undoAction,
        id: 'action-undo',
      },
      redo: {
        icon: 'redo',
        tooltipKey: 'actionMap.redo',
        action: this.editor.redoAction,
        id: 'action-redo',
      },
      copy: {
        icon: 'copy',
        tooltipKey: 'actionMap.copy',
        action: this.editor.copySelectionToClipboard,
        id: 'action-copy-to-clipboard',
      },
      paste: {
        icon: 'paste',
        tooltipKey: 'actionMap.paste',
        action: this.editor.pasteFromClipboard,
        id: 'action-paste-from-clipboard',
      },
      delete: {
        icon: 'delete',
        tooltipKey: 'actionMap.delete',
        action: this.editor.deleteSelectedObjects,
        id: 'action-delete-selected-objects',
      },
      showMoreCanvasActions: {
        icon: 'moreactions',
        tooltipKey: 'actionMap.showMoreCanvasActions',
        action: this.editor.toggleCanvasActions,
        id: 'action-show-more-canvas-options',
      },
      convertSelectionToButton: {
        icon: 'button-object-dark',
        tooltipKey: 'actionMap.convertSelectionToButton',
        action: this.editor.createButtonFromSelection,
        id: 'action-convert-selection-to-button',
        color: 'active-green'
      },
      convertSelectionToClip: {
        icon: 'clip-object-dark',
        tooltipKey: 'actionMap.convertSelectionToClip',
        action: this.editor.createClipFromSelection,
        id: 'action-convert-selection-to-clip',
        color: 'active-blue'
      },
      addAssetToCanvas: {
        icon: 'add',
        tooltipKey: 'actionMap.addAssetToCanvas',
        action: this.editor.createInstanceOfSelectedAsset,
        id: 'action-create-instance-of-selected-asset',
        color: 'active-blue'
      },
    }
  }

  /**
   * The editor actions, with tooltip text resolved from the current
   * language. This is a getter (not a plain property) so that every
   * access re-resolves each tooltipKey through `this.t`, keeping tooltips
   * correct even if the interface language changes after this
   * ActionMapInterface was constructed.
   * @type {object}
   */
  get editorActions () {
    let resolved = {};
    Object.keys(this._editorActionDefinitions).forEach((key) => {
      let definition = this._editorActionDefinitions[key];
      resolved[key] = Object.assign({}, definition, {
        tooltip: this.t ? this.t(definition.tooltipKey) : definition.tooltipKey,
      });
    });
    return resolved;
  }
}

export default ActionMapInterface;
