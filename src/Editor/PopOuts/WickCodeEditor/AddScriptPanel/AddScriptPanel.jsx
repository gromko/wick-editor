/*
Copyright 2020 WICKLETS LLC
This file is part of Wick Editor.
... (ліцензія)
*/
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import capitalize from 'Editor/Util/DataFunctions/capitalize';
let classNames = require('classnames');

class AddScriptPanel extends Component {
  render() {
    const { t } = this.props;
    return (
      <div className="add-script-container">
        <div className="add-script-tabs">
           <button 
           className={classNames("add-script-tab", "we-event", "Mouse", {selected: "Mouse" === this.props.addScriptTab})} 
           onClick={() => this.props.changeTab('Mouse')}>
             {t('addScriptPanel.mouse')}
           </button>
           <button 
           className={classNames("add-script-tab", "we-event", "Keyboard", {selected: "Keyboard" === this.props.addScriptTab})}  
           onClick={() => this.props.changeTab('Keyboard')}>
             {t('addScriptPanel.keyboard')}
           </button>
           <button 
           className={classNames("add-script-tab", "we-event", "Timeline", {selected: "Timeline" === this.props.addScriptTab})}  
           onClick={() => this.props.changeTab('Timeline')}>
             {t('addScriptPanel.timeline')}
           </button>
         </div>
         <div className="add-script-buttons">
           {this.props.scripts.map((script, i) => {
             return <button
               className={classNames("add-script-button", script.type)}
               key={'add-script-button-' + i}
               disabled={this.props.availableScripts && this.props.availableScripts.indexOf(script.name) === -1}
               onClick={() => this.props.addScript && this.props.addScript(script.name)}
             >
               <div className="add-script-button-title">{capitalize(script.name)}</div>
               <div className="add-script-button-description"> {script.description}</div>
             </button>
           })}
         </div>
       </div>
     )
  }
}

export default withTranslation()(AddScriptPanel);
