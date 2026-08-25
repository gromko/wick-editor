/*
Copyright 2020 WICKLETS LLC
This file is part of Wick Editor.
... (ліцензія)
*/
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import ScriptWindowRow from './ScriptWindowRow/ScriptWindowRow';
import './_inspectorscriptwindow.scss';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

class InspectorScriptWindow extends Component {
  renderScriptRow = (scriptobj, i) => {
    return (
      <ScriptWindowRow
        scriptInfoInterface={this.props.scriptInfoInterface}
        key={i}
        name={scriptobj.name}
        deleteScript={() => {this.props.deleteScript(this.props.script, scriptobj.name)}}
        editScript={() => {this.props.editScript(scriptobj.name)}} />
    );
  }

  render() {
    const { t } = this.props;
    return(
      <div className="inspector-script-window-container" >
        <div className="inspector-script-window-header" >
          {t('inspectorScriptWindow.title')}
        </div >
        <div className="inspector-script-window-body" >
          {this.props.script.scripts.map(this.renderScriptRow)}
          <div className="inspector-script-window-row-container" >
            <ActionButton
              color="inspector"
              text={t('inspectorScriptWindow.addScript')}
              action={() => this.props.editScript("add")}
            />
          </div >
        </div >
      </div >
    )
  }
}

export default withTranslation()(InspectorScriptWindow);
