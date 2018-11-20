import * as React from 'react';
import * as Polyglot from 'node-polyglot';
import { LocalizeContext } from './Globals';

export interface ILocalizeProps {
  t: string;
  options?: number | Polyglot.InterpolationOptions;
  transformString?: (translated: string) => string;
}

/**
 * React component for mapping keys to localized sentences.
 */
export const Localize: React.SFC<ILocalizeProps> = ({ t, options, transformString }) => (
  <LocalizeContext.Consumer>
    {localize => {
      const localeString = localize.t(t, options as number); // Fixes ts complaining
      if (transformString) return transformString(localeString);
      return localeString;
    }}
  </LocalizeContext.Consumer>
);
