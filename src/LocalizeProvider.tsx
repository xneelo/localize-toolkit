import * as React from 'react';
import { localizePolyglot, LocalizeContext } from './Globals';

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
  cachePhrases?: boolean;
}

export const LocalizeProvider: React.SFC<ILocalizeProviderProps> = ({
  children,
  initialLanguage,
  initialPhrases,
  getPhrases,
  onFailed,
  loadingComponent,
  cachePhrases,
}) => {
  // The current localization language.
  const [currentLanguage, setCurrentLanguage] = React.useState<string>('');

  // The cache of phrases mapped to their language.
  const [phrases, setPhrases] = React.useState<{ [language: string]: IPhrases }>({});

  // The current status of fetching languages from getPhrases.
  const [status, setStatus] = React.useState<ProviderStatus>(ProviderStatus.Loading);

  // Call setLanguage on component mount if initial language provided.
  React.useEffect(() => {
    if (!currentLanguage && initialLanguage) setLanguage(initialLanguage, initialPhrases);
  }, []);

  /**
   * Set the current language, and provide an optional language object. If no
   * language object is provided, will attempt to fetch language using language
   * token from provided getPhrases API.
   * @param language Language token (example: 'en').
   * @param languageObject Optional. Object of localize token maps for the language.
   */
  const setLanguage = async (language: string, languageObject?: IPhrases) => {
    // New language object will be either given object, fetched object, or
    // null. If new language object is not defined at this step, and there is
    // no cache for the language, then this statement will throw and the
    // language will not be set (no language object available).
    try {
      let newLanguageObject: IPhrases | null = null;
      if (languageObject) {
        newLanguageObject = languageObject;
      } else if (!isLanguageCached(language) && getPhrases) {
        setStatus(ProviderStatus.Loading);
        newLanguageObject = await getPhrases(language);
      } else if (!isLanguageCached(language)) {
        throw new Error(
          `No language object provided, language ${language} is not cached, and no getPhrases function is provided.`,
        );
      }

      // Update the current language.
      setCurrentLanguage(language);

      // Clear current mapped language in polyglot.
      localizePolyglot.clear();

      // Extend polyglot to use new language object or cached, and set locale.
      localizePolyglot.extend(newLanguageObject || phrases[language]);
      localizePolyglot.locale(language);

      // Store new language object in the state if new object exists and
      // cache phrases is true.
      if (newLanguageObject && cachePhrases) {
        setPhrases(
          previousState =>
            ({
              ...previousState,
              [language]: newLanguageObject,
            } as { [language: string]: IPhrases }),
        );
      }
    } catch (error) {
      if (onFailed) onFailed(error);
    }

    if (status === ProviderStatus.Loading) setStatus(ProviderStatus.Loaded);
  };

  /**
   * Returns true if language is currently cached by the Localize Provider.
   * @param language Language token (example: 'en').
   */
  const isLanguageCached = (language: string) => language in phrases;

  /**
   * Clears a cached language object. If no language is provided, clears the
   * entire cache of language objects.
   */
  const clearCache = (language?: string) => {
    if (language) {
      if (language in phrases) {
        const newState = { ...phrases };
        delete newState[language];
        setPhrases(newState);
      }
    } else {
      setPhrases({});
    }
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
      {status === ProviderStatus.Loaded ? children : loadingComponent || null}
    </LocalizeContext.Provider>
  );
};
