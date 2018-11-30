import * as React from 'react';
import { localizePolyglot, LocalizeContext, ILocalizeContextValue } from './Globals';

enum ProviderStatus {
  Loading = 'loading',
  Loaded = 'loaded',
}

export interface IPhrases {
  [phrase: string]: string | IPhrases;
}

export interface ILocalizeProviderProps {
  initialLanguage?: string;
  initialPhrases?: IPhrases;
  getPhrases?: ((language: string) => IPhrases);
  onFailed?: ((error: Error) => any);
  loadingComponent?: React.ReactNode;
  noCache?: boolean;
}

export const LocalizeProvider: React.SFC<ILocalizeProviderProps> = ({
  children,
  initialLanguage,
  initialPhrases,
  getPhrases,
  onFailed,
  loadingComponent,
  noCache,
}) => {
  // The current localization language.
  const [currentLanguage, setCurrentLanguage] = React.useState<string>('');

  // The cache of phrases mapped to their language.
  const [storedPhrases, setStoredPhrases] = React.useState<{ [language: string]: IPhrases }>({});

  // The current status of fetching languages from getPhrases.
  const [status, setStatus] = React.useState<ProviderStatus>(ProviderStatus.Loading);

  // Call setLanguage on component mount if initial language provided.
  React.useEffect(() => {
    if (!currentLanguage && initialLanguage) setLanguage(initialLanguage, initialPhrases);
  }, []);

  const setLanguage = async (language: string, phrases?: IPhrases) => {
    // New language object will be either given object, fetched object, or
    // null. If new language object is not defined at this step, and there is
    // no cache for the language, then this statement will throw and the
    // language will not be set (no language object available).
    try {
      let newPhrases: IPhrases | null = null;
      if (phrases) {
        newPhrases = phrases;
      } else if (!isLanguageCached(language) && getPhrases) {
        setStatus(ProviderStatus.Loading);
        newPhrases = await getPhrases(language);
      } else if (!isLanguageCached(language)) {
        throw new Error(
          `No language object provided, language ${language} is not cached, and no getPhrases function is provided.`,
        );
      } else {
        newPhrases = storedPhrases[language];
      }

      // Update the current language.
      setCurrentLanguage(language);

      // Clear current mapped language in polyglot.
      localizePolyglot.clear();

      // Extend polyglot to use new language object or cached, and set locale.
      localizePolyglot.extend(newPhrases);
      localizePolyglot.locale(language);

      // Store new language object in the state if new object exists and no
      // cache is false.
      if (newPhrases && !noCache) {
        setStoredPhrases(previousState => ({
          ...previousState,
          [language]: newPhrases as IPhrases,
        }));
      }
    } catch (error) {
      if (onFailed) onFailed(error);
    }

    setStatus(ProviderStatus.Loaded);
  };

  const isLanguageCached = (language: string) => language in storedPhrases;

  const clearCache = (language?: string) => {
    if (language) {
      if (language in storedPhrases) {
        const newState = { ...storedPhrases };
        delete newState[language];
        setStoredPhrases(newState);
      }
    } else {
      setStoredPhrases({});
    }
  };

  // Provider value
  const value: ILocalizeContextValue = {
    currentLanguage,
    isLoaded: status === ProviderStatus.Loaded,
    setLanguage,
    isLanguageCached,
    clearCache,
    t: (phrase, options?) => localizePolyglot.t(phrase, options as number), // Fixes ts complaining
  };

  return (
    <LocalizeContext.Provider value={value}>
      {status === ProviderStatus.Loading && loadingComponent ? loadingComponent : children}
    </LocalizeContext.Provider>
  );
};
