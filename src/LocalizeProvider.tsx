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
  getPhrases?: ((language: string) => Promise<IPhrases>);
  onFailed?: ((error: Error) => any);
  loadingComponent?: React.ReactNode;
  noCache?: boolean;
}

interface ILocalizeProviderState {
  currentLanguage: string;
  cachedPhrases: { [language: string]: IPhrases };
  status: ProviderStatus;
}

export class LocalizeProvider extends React.PureComponent<ILocalizeProviderProps, ILocalizeProviderState> {
  public state: ILocalizeProviderState = {
    currentLanguage: '',
    cachedPhrases: {},
    status: ProviderStatus.Loading,
  };

  public componentDidMount() {
    const { initialLanguage, initialPhrases } = this.props;
    const { currentLanguage } = this.state;

    if (!currentLanguage && initialLanguage) this.setLanguage(initialLanguage, initialPhrases);
  }

  public render() {
    const { loadingComponent, children } = this.props;
    const { currentLanguage, status } = this.state;

    // Provider value
    const value: ILocalizeContextValue = {
      currentLanguage,
      isLoaded: status === ProviderStatus.Loaded,
      setLanguage: this.setLanguage,
      isLanguageCached: this.isLanguageCached,
      clearCache: this.clearCache,
      t: (phrase, options?) => localizePolyglot.t(phrase, options),
    };

    return (
      <LocalizeContext.Provider value={value}>
        {status === ProviderStatus.Loading && loadingComponent ? loadingComponent : children}
      </LocalizeContext.Provider>
    );
  }

  private setLanguage = async (language: string, phrases?: IPhrases) => {
    const { getPhrases, onFailed, noCache } = this.props;
    const { cachedPhrases } = this.state;

    // New language object will be either given object, fetched object, or
    // null. If new language object is not defined at this step, and there is
    // no cache for the language, then this statement will throw and the
    // language will not be set (no language object available).
    try {
      let newPhrases: IPhrases | null = null;
      if (phrases) {
        newPhrases = phrases;
      } else if (!this.isLanguageCached(language) && getPhrases) {
        this.setState({ status: ProviderStatus.Loading });
        newPhrases = await getPhrases(language);
      } else if (!this.isLanguageCached(language)) {
        throw new Error(
          `No language object provided, language ${language} is not cached,` +
            ` and the getPhrases prop is not provided.`,
        );
      } else {
        newPhrases = cachedPhrases[language];
      }

      // Update the current language.
      this.setState({ currentLanguage: language });

      // Clear current mapped language in polyglot.
      localizePolyglot.clear();

      // Extend polyglot to use new language object or cached, and set locale.
      localizePolyglot.extend(newPhrases);
      localizePolyglot.locale(language);

      // Store new language object in the state if new object exists and no
      // cache is false.
      if (newPhrases && !noCache) {
        this.setState(previousState => ({
          cachedPhrases: {
            ...previousState.cachedPhrases,
            [language]: newPhrases as IPhrases,
          },
        }));
      }
    } catch (error) {
      if (onFailed) onFailed(error);
    }

    this.setState({ status: ProviderStatus.Loaded });
  };

  private isLanguageCached = (language: string) => {
    const { cachedPhrases } = this.state;

    return language in cachedPhrases;
  };

  private clearCache = (language?: string) => {
    const { cachedPhrases } = this.state;

    if (language) {
      if (language in cachedPhrases) {
        const newState = { ...cachedPhrases };
        delete newState[language];
        this.setState({ cachedPhrases: newState });
      }
    } else {
      this.setState({ cachedPhrases: {} });
    }
  };
}
