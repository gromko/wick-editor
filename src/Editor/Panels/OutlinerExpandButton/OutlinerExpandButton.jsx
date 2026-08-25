import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_outlinerexpandbutton.scss';

var classNames = require("classnames");

class OutlinerExpandButton extends Component {
  render () {
    const { t } = this.props;

    return (
      <ActionButton
      color="tool"
      containerClassName="outliner-expand-button"   // новий проп
      isActive={ () => false }
      id="outliner-toggle"
      tooltip={this.props.expanded ? t('outliner.hideOutliner') : t('outliner.showOutliner')}
      action={this.props.toggleOutliner}
      tooltipPlace="left"
      icon="outliner"
      //className="outliner-expand-button"
      iconClassName={classNames("outliner-toggle-icon", {"outliner-expand-button-closed": !this.props.expanded})}
      />
    );
  }
}

export default withTranslation()(OutlinerExpandButton)
