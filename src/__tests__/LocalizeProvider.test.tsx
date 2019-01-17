import * as React from 'react';
import * as Renderer from 'react-test-renderer';
import { LocalizeProvider, IPhrases, Localize, LocalizeContext } from '..';

let mockSuccessGetPhrases = jest.fn(() => Promise.resolve({ hi: 'Hi' }));
let mockFailedGetPhrases = jest.fn(() => Promise.reject('Failed'));

describe('LocalizeProvider', () => {
  beforeEach(() => {
    mockSuccessGetPhrases = jest.fn(() => Promise.resolve({ hi: 'Hi' }));
    mockFailedGetPhrases = jest.fn(() => Promise.reject('Failed'));
  });

  /**
   * initialLanguage + initialPhrases prop
   */
  describe('initialLanguage and initialPhrases', () => {
    it('calls getPhrases if initialLanguage is provided without initialPhrases', done => {
      const getPhrasesMock = () => done();
      Renderer.create(
        <LocalizeProvider initialLanguage="en" getPhrases={getPhrasesMock}>
          <div>{'Child'}</div>
        </LocalizeProvider>,
      );
    });

    it('initialPhrases used if provided with initialLanguage', done => {
      Renderer.create(
        <LocalizeProvider initialLanguage="en" initialPhrases={{ hi: 'Hello' }}>
          <LocalizeContext.Consumer>
            {l => {
              const localeString = l.t('hi');
              if (localeString === 'Hello') done();
              return localeString;
            }}
          </LocalizeContext.Consumer>
        </LocalizeProvider>,
      );
    });
  });

  /**
   * getPhrases prop
   */
  describe('getPhrases', () => {
    it('is called if setLanguage is called without providing phrases', done => {
      const LocalizeMock: React.SFC<{}> = () => (
        <LocalizeContext.Consumer>
          {localize => {
            if (!localize.isLoaded) localize.setLanguage('en');
            return null;
          }}
        </LocalizeContext.Consumer>
      );
      const getPhrasesMock = () => done();
      Renderer.create(
        <LocalizeProvider getPhrases={getPhrasesMock}>
          <LocalizeMock />
        </LocalizeProvider>,
      );
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
      Renderer.create(
        <LocalizeProvider initialLanguage="en" onFailed={onFailedMock} getPhrases={mockFailedGetPhrases}>
          <div>{'Child'}</div>
        </LocalizeProvider>,
      );
    });

    it('is called if getPhrases is not provided and no cached phrases', done => {
      const onFailedMock = () => done();
      Renderer.create(
        <LocalizeProvider initialLanguage="en" onFailed={onFailedMock}>
          <div>{'Child'}</div>
        </LocalizeProvider>,
      );
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
