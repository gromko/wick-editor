/*
Copyright 2020 WICKLETS LLC
This file is part of Wick Editor.
... (ліцензія)
*/
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import './_scriptwindowrow.scss';

// https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

class ScriptWindowRow extends Component {
  getColorBar = () => {
    let scriptsByType = this.props.scriptInfoInterface.scriptsByType;
    let color = 'blue-bar'; 
    Object.keys(scriptsByType).forEach(type => {
      if (scriptsByType[type].indexOf(this.props.name) > -1) {
        color = this.props.scriptInfoInterface.scriptTypeColors[type] + "-bar";
      }
    }); 
    return color;
  }

  render() {
    const { t } = this.props;
    let scriptName = capitalize(this.props.name);
    
    return(
      <div className="inspector-script-window-row-container" >
        <div className="script-row-item inspector-script-window-row-name" >
          <div className={"inspector-script-window-row-color-bar  " + this.getColorBar()}/>
          <ActionButton
            id={"inspector-script-window-row-edit" + this.props.name}
            text={capitalize(this.props.name)}
            tooltip={t('scriptWindowRow.editTooltip', { name: scriptName })}
            tooltipPlace="left"
            action={this.props.editScript}
            color="script-name"
            className="action-button-script-name"
          />
        </div>
        <div className="script-row-item inspector-script-window-row-delete" >
          <ActionButton
            id={"inspector-script-window-row-delete" + this.props.name}
            icon="delete-black"
            tooltip={t('scriptWindowRow.deleteTooltip')}
            tooltipPlace="left"
            color="red"
            action={this.props.deleteScript}
          />
        </div>
      </div>
    );
  }
}

export default withTranslation()(ScriptWindowRow);
