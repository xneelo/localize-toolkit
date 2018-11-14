import * as React from 'react';
import * as Polyglot from 'node-polyglot';
import { LocalizeContext } from './Globals';

export interface ILocalizeProps {
  t: string;
  options?: number | Polyglot.InterpolationOptions;
  isUpper?: boolean;
  isLower?: boolean;
}

/**
 * React component for mapping keys to localized sentences.
 */
export const Localize: React.SFC<ILocalizeProps> = ({ t, options, isUpper = false, isLower = false }) => {
  const consumerFunc = localize => {
    let localeString = localize.t(t, options);
    if (isUpper) localeString = localeString.toUpperCase();
    if (isLower) localeString = localeString.toLowerCase();
    return localeString;
  };
  return <LocalizeContext.Consumer>{consumerFunc}</LocalizeContext.Consumer>;
};
