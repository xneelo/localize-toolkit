import {useContext} from 'react';
import {LocalizeContext} from './Instances';

export const useLocalize = () => {
  const localize = useContext(LocalizeContext);
  return localize;
};
