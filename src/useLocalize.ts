import {useContext} from 'react';
import {LocalizeContext} from './Instances';
import {LocalizeContextValue} from './types';

/**
 * A hook that returns the localize context value.
 */
export const useLocalize = (): LocalizeContextValue => {
  const localize = useContext(LocalizeContext);
  return localize;
};
