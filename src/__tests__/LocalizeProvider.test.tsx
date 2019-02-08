import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Renderer from 'react-test-renderer';
import { LocalizeContext, LocalizeProvider } from '..';

let mockSuccessGetPhrases = jest.fn(() => Promise.resolve({ hi: 'Hi' }));
let mockFailedGetPhrases = jest.fn(() => Promise.reject('Failed'));

let container: HTMLDivElement;

describe('LocalizeProvider', () => {
  beforeEach(() => {
    mockSuccessGetPhrases = jest.fn(() => Promise.resolve({ hi: 'Hi' }));
    mockFailedGetPhrases = jest.fn(() => Promise.reject('Failed'));

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  /**
   * initialLanguage + initialPhrases prop
   */
  describe('initialLanguage and initialPhrases', () => {
    it('calls getPhrases if initialLanguage is provided without initialPhrases', done => {
      const getPhrasesMock = () => done();
      Renderer.act(() => {
        ReactDOM.render(
          <LocalizeProvider initialLanguage="en" getPhrases={getPhrasesMock}>
            <div>{'Child'}</div>
          </LocalizeProvider>,
          container,
        );
      });
    });

    it('initialPhrases used if provided with initialLanguage', done => {
      Renderer.act(() => {
        ReactDOM.render(
          <LocalizeProvider initialLanguage="en" initialPhrases={{ hi: 'Hello' }}>
            <LocalizeContext.Consumer>
              {l => {
                const localeString = l.t('hi');
                if (localeString === 'Hello') done();
                return localeString;
              }}
            </LocalizeContext.Consumer>
          </LocalizeProvider>,
          container,
        );
      });
    });
  });

  /**
   * getPhrases prop
   */
  describe('getPhrases', () => {
    it('is called if setLanguage is called without providing phrases', done => {
      const LocalizeMock: React.SFC<{}> = () => {
        const localize = React.useContext(LocalizeContext);
        if (!localize.isLoaded) localize.setLanguage('en');
        return null;
      };
      const getPhrasesMock = () => done();
      Renderer.act(() => {
        ReactDOM.render(
          <LocalizeProvider getPhrases={getPhrasesMock}>
            <LocalizeMock />
          </LocalizeProvider>,
          container,
        );
      });
    });
  });

  /**
   * onFailed prop
   */
  describe('onFailed', () => {
    it('is called if getPhrases fails', done => {
      const onFailedMock = () => {
        expect(mockFailedGetPhrases.mock.calls.length).toBe(1);
        done();
      };
      Renderer.act(() => {
        ReactDOM.render(
          <LocalizeProvider initialLanguage="en" onFailed={onFailedMock} getPhrases={mockFailedGetPhrases}>
            <div>{'Child'}</div>
          </LocalizeProvider>,
          container,
        );
      });
    });

    it('is called if getPhrases is not provided and no cached phrases', done => {
      const onFailedMock = () => done();
      Renderer.act(() => {
        ReactDOM.render(
          <LocalizeProvider initialLanguage="en" onFailed={onFailedMock}>
            <div>{'Child'}</div>
          </LocalizeProvider>,
          container,
        );
      });
    });
  });

  /**
   * loadingComponent prop
   */
  describe('loadingComponent', () => {
    it('renders children if loading and loading component is not provided', () => {
      const localize = Renderer.create(
        <LocalizeProvider>
          <div>{'Child'}</div>
        </LocalizeProvider>,
      ).toJSON();
      expect(localize).toMatchSnapshot();
    });

    it('renders if loading and loading component is provided', () => {
      const localize = Renderer.create(
        <LocalizeProvider loadingComponent={<div>{'Loading...'}</div>}>
          <div>{'Child'}</div>
        </LocalizeProvider>,
      ).toJSON();
      expect(localize).toMatchSnapshot();
    });
  });
});
