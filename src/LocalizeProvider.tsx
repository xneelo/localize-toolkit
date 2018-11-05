import * as React from 'react';
import { localizePolyglot, LocalizeContext } from './Globals';

enum ProviderStatus {
  Loading = 'loading',
  Loaded = 'loaded',
}

export interface ILanguageObject {
  [phrase: string]: string | ILanguageObject;
}

export interface ILocalizeProviderProps {
  children: React.ReactNode;
  initLanguage?: string;
  initLanguageObject?: ILanguageObject;
  getLanguage?: (language: string) => ILanguageObject;
  onFailed?: (error: Error) => any;
  loadingComponent?: React.ReactNode;
}

export const LocalizeProvider: React.SFC<ILocalizeProviderProps> = ({
  children,
  initLanguage = '',
  initLanguageObject = null,
  getLanguage = null,
  onFailed = null,
  loadingComponent = null,
}) => {
  const [currentLanguage, setCurrentLanguage] = React.useState('');

  const [languageObjects, setLanguageObjects] = React.useState({});

  const [status, setStatus] = React.useState(ProviderStatus.Loading);

  React.useEffect(() => {
    if (!currentLanguage && initLanguage) {
      setLanguage(initLanguage, initLanguageObject);
    }
  }, []);

  /**
   * Set the current language, and provide an optional language object. If no
   * language object is provided, will attempt to fetch language using language
   * token from provided getLanguage API.
   * @param language Language token (example: 'en').
   * @param languageObject Optional. Object of
   * localize token maps for the language.
   * @param shouldCache Optional. Should cache the resulting language
   * object for future reference.
   */
  const setLanguage = async (
    language: string,
    languageObject: ILanguageObject | null = null,
    shouldCache: boolean = true,
  ) => {
    setStatus(ProviderStatus.Loading);

    try {
      // New language object will be either given object, fetched object, or
      // null. If new language object is not defined at this step, and there is
      // no cache for the language, then this statement will throw and the
      // language will not be set (no language object available).
      let newLanguageObject: ILanguageObject | null = null;
      if (languageObject) {
        newLanguageObject = languageObject;
      } else if (!isLanguageCached(language) && getLanguage) {
        newLanguageObject = await getLanguage(language);
      } else if (!isLanguageCached(language)) {
        throw new Error(
          `No language object provided, language ${language} is not cached, ` +
            `and no getLanguage function is provided.`,
        );
      }

      // Update the current language.
      setCurrentLanguage(language);

      // Clear current mapped language in polyglot.
      localizePolyglot.clear();

      // Extend polyglot to use new language object or cached, and set locale.
      localizePolyglot.extend(newLanguageObject || languageObjects[language]);
      localizePolyglot.locale(language);

      // Store new language object in the state if new object exists and
      // shouldCache is true.
      if (newLanguageObject && shouldCache) {
        setLanguageObjects(prev => ({
          ...prev,
          [language]: newLanguageObject,
        }));
      }
    } catch (error) {
      console.error(error);
      if (typeof onFailed === 'function') onFailed(error);
    }

    setStatus(ProviderStatus.Loaded);
  };

  /**
   * Returns true if language is currently cached by the Localize Provider.
   * @param language Language token (example: 'en').
   */
  const isLanguageCached = (language: string) => language in languageObjects;

  /**
   * Clears all cached language objects except for the one in use for the
   * current language.
   */
  const clearCache = () => {
    const currentLanguageObject = languageObjects[currentLanguage];
    setLanguageObjects({ [currentLanguage]: currentLanguageObject });
  };

  // Provider value
  const value = {
    t: (phrase, options?) => localizePolyglot.t(phrase, options),
    setLanguage,
    isLanguageCached,
    clearCache,
    currentLanguage,
    isLoaded: status === ProviderStatus.Loaded,
  };

  return (
    <LocalizeContext.Provider value={value}>
      {status === ProviderStatus.Loaded ? children : loadingComponent}
    </LocalizeContext.Provider>
  );
};
