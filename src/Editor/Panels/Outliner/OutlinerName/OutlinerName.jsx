import React from 'react';
import { useTranslation } from 'react-i18next';

import './_outlinername.scss';

// Matches the Wick Engine's default auto-generated layer name, e.g.
// "Layer" (the very first layer) or "Layer 2", "Layer 3", etc.
// This pattern intentionally matches the raw, untranslated English name
// as stored by the engine — it does NOT match a name the user has
// manually renamed (which is shown verbatim, in whatever language/text
// the user typed).
const DEFAULT_LAYER_NAME_PATTERN = /^Layer(?: (\d+))?$/;

const OutlinerName = ({ type, name }) => {
  const { t } = useTranslation();

  let displayName = name;

  // Only re-translate the name for display if this is a layer, and its
  // name still matches the engine's default naming pattern. The actual
  // underlying data.name is never modified — only what's shown here.
  if (type === 'layer' && typeof name === 'string') {
    let match = name.match(DEFAULT_LAYER_NAME_PATTERN);
    if (match) {
      displayName = match[1]
        ? t('outliner.defaultLayerNameNumbered', { number: match[1] })
        : t('outliner.defaultLayerName');
    }
  }

  return (
    <div className={"outliner-name-" + type}>
      {displayName}
    </div>
  );
};

export default OutlinerName;
