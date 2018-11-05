## Functional component example

```js
import React, { useContext, useEffect } from 'react';
import { LocalizeContext, Localize } from 'react-localize';

function MyComponent({}) {
  const localize: Localize = useContext(LocalizeContext);

  useEffect(() => {
    localize.setLanguage('en');
  }, []);

  return (
    <>
      {/* Can do either one! */}
      {localize.t('translate_token')}
      <Localize t={'translate_token'} />
    </>
  );
}
```

## Class component example

```js
import React, { Component } from 'react';
import { LocalizeContext, Localize } from 'react-localize';

class MyComponent extends Component {
  static contextType = LocalizeContext;

  componentDidMount() {
    const localize: Localize = this.context;
    localize.setLanguage('en');
  }

  render() {
    const localize: Localize = this.context;

    return (
      <>
        {/* Can do either one! */}
        {localize.t('translate_token')}
        <Localize t={'translate_token'} />
      </>
    );
  }
}
```

## Type definitions

```ts
/**
 * The Localize object.
 */
declare interface Localize {

  /**
   * Translate a phrase using the Polyglot library.
   * @param phrase Token to translate.
   */
  t(phrase: string): string;
  t(phrase: string, smartCount: number): string;
  t(phrase: string, options: { [key: string]: any }): string;

  /**
   * Set the language, and provide an optional translation object. If not given,
   * will hit a provided API
   * @param language
   * @param langObject
   */
  setLanguage(language: string, langObject?: { [key: string]: string }): void;
}


localize.clearCache(): void
```
