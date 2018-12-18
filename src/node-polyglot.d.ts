declare module 'node-polyglot' {
  namespace Polyglot {
    interface InterpolationOptions {
      smart_count?: number | { length: number };
      _?: string;

      [interpolationKey: string]: any;
    }

    interface PolyglotOptions {
      phrases?: any;
      locale?: string;
      allowMissing?: boolean;
      onMissingKey?: (key: string, options?: Polyglot.InterpolationOptions, locale?: string) => string;
    }
  }

  class Polyglot {
    constructor(options?: Polyglot.PolyglotOptions);

    extend(phrases: any): void;

    t(phrase: string, options?: number | Polyglot.InterpolationOptions): string;

    clear(): void;

    replace(phrases: any): void;

    locale(): string;

    locale(locale: string): void;

    has(phrase: string): boolean;
  }

  export = Polyglot;
}
