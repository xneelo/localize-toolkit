import React from 'react';
import {LocalizeContext} from './Instances';
import {LocalizeProps} from './types';

/**
 * React component for mapping keys to localized sentences.
 */
export const Localize: React.FC<LocalizeProps> = ({t, options, transformString}) => (
  <LocalizeContext.Consumer>
    {localize => {
      const localeString = localize.t(t, options);
      if (transformString) return transformString(localeString);
      return localeString;
    }}
  </LocalizeContext.Consumer>
);
