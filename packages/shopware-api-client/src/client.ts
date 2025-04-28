import { InjectionKey } from 'vue';
import type {
  Operation,
  OperationOptions,
  OperationProp,
  ShopwareClientOptions
} from './types';

export class ShopwareApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'ShopwareApiError';
  }
}

const operationRegex = /^(?<name>\w+?)\s(?<method>get|post|put|patch|delete)\s+(?<url>\/.*)/i;

export class ShopwareClient<Operations extends Record<string, { body?: unknown; response?: unknown }>> {
  private options: ShopwareClientOptions = {
    baseURL: '',
    apiKey: '',
    language: '',
    includeSeoUrls: false,
  };

  constructor(options: ShopwareClientOptions) {
    this.setBaseURL(options.baseURL);
    this.setApiKey(options.apiKey);
    this.setLanguage(options.language);
    this.setIncludeSeoUrls(options.includeSeoUrls);
    this.options = options;
  }

  public setBaseURL(baseURL: string) {
    if (typeof baseURL !== 'string') {
      throw new Error('Invalid baseURL: It must be a string.');
    }

    this.options.baseURL = baseURL;
  }

  public setApiKey(apiKey: string) {
    if (typeof apiKey !== 'string') {
      throw new Error('Invalid apiKey: It must be a string.');
    }

    this.options.apiKey = apiKey;
  }

  public setLanguage(language: string | undefined) {
    if (language && typeof language !== 'string') {
      throw new Error('Invalid language: If provided, it must be a string.');
    }

    this.options.language = language;
  }

  public setIncludeSeoUrls(includeSeoUrls: boolean = true) {
    this.options.includeSeoUrls = includeSeoUrls;
  }

  private isOperationKey(key: string): key is keyof Operations & string {
    return operationRegex.test(key);
  }

  private parseOperation(operation: keyof Operations & string): {
    name: string;
    method: string;
    url: string;
  } {
    const match = operationRegex.exec(operation);
    if (!match?.groups) {
      throw new Error('Invalid operation format');
    }
    return {
      name: match.groups.name,
      method: match.groups.method.toUpperCase(),
      url: match.groups.url,
    };
  }

  private interpolateUrl(url: string, params: Record<string, string>): string {
    return url.replace(/{([^}]+?)}/g, (_, param) => {
      if (!(param in params)) {
        throw new Error(`Missing required URL parameter: ${param}`);
      }
      return params[param];
    });
  }

  async query<OperationKey extends (keyof Operations) & string>(
    operation: OperationKey,
    options: OperationOptions<Operations, OperationKey>,
  ): Promise<OperationProp<Operations, OperationKey, 'response'>> {
    try {
      const { method, url } = this.parseOperation(operation);

      const interpolatedUrl = this.interpolateUrl(url, options.params);

      const response = await fetch(`${this.options.baseURL}/store-api${interpolatedUrl}`, {
        ...options,
        method,
        headers: {
          'Content-Type': 'application/json',
          'sw-access-key': this.options.apiKey,
          ...(this.options.includeSeoUrls && { 'sw-include-seo-urls': 'true' }),
          ...(this.options.language && { 'sw-language-id': this.options.language }),
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new ShopwareApiError(
          `Shopware API request failed: ${response.statusText}`,
          response.status,
          await response.json().catch(() => undefined),
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ShopwareApiError) {
        throw error;
      }

      throw new ShopwareApiError(
        'Failed to communicate with Shopware API',
        500,
        error instanceof Error ? error.message : undefined,
      );
    }
  }
}
