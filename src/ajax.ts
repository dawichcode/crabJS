/**
 * Interface for AJAX request options
 */
export interface Options {
  /** HTTP method (e.g., 'GET', 'POST') */
  method?: string;
  /** The URL to send the request to */
  url: string;
  /** Data to send with the request */
  data?: any;
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** Query parameters to append to the URL */
  params?: Record<string, string>;
  /** Timeout for the request in milliseconds */
  timeout?: number;
  /** Expected response type (e.g., 'json', 'text') */
  responseType?: XMLHttpRequestResponseType;
  /** Content type of the request */
  contentType?: string;
  /** Callback function for successful response */
  success?: (response: any) => void;
  /** Callback function for error response */
  error?: (status: number, statusText: string, error?: Error) => void;
}

export class CrabJsAjax {
  /**
   * Performs an AJAX request with the given options
   * @param options - The options for the AJAX request
   */
  public static ajax(options: Options): void {
    try {
      if (!options.url) {
        throw new Error('URL is required for AJAX request');
      }

      const xhr = new XMLHttpRequest();
      const urlWithParams = CrabJsAjax.buildUrlWithParams(options.url, options.params);
      xhr.open(options.method || 'GET', urlWithParams, true);

      // Set custom headers
      if (options.headers) {
        try {
          for (const key in options.headers) {
            xhr.setRequestHeader(key, options.headers[key]);
          }
        } catch (error) {
          if (options.error) {
            options.error(0, 'Invalid headers', error as Error);
          }
          return;
        }
      }

      // Set content type
      if (options.contentType) {
        xhr.setRequestHeader('Content-Type', options.contentType);
      } else {
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      }

      // Set response type
      if (options.responseType) {
        try {
          xhr.responseType = options.responseType;
        } catch (error) {
          if (options.error) {
            options.error(0, 'Invalid response type', error as Error);
          }
          return;
        }
      }

      // Handle response
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = options.responseType === 'json' ? JSON.parse(xhr.responseText) : xhr.responseText;
              options.success && options.success(response);
            } catch (error) {
              options.error && options.error(xhr.status, 'Error parsing response', error as Error);
            }
          } else {
            options.error && options.error(xhr.status, xhr.statusText);
          }
        }
      };

      // Handle network errors
      xhr.onerror = () => {
        options.error && options.error(xhr.status, 'Network error');
      };

      // Handle timeout
      if (options.timeout) {
        xhr.timeout = options.timeout;
        xhr.ontimeout = () => {
          options.error && options.error(xhr.status, 'Request timed out');
        };
      }

      // Prepare data to send
      let dataToSend: string | null = null;
      if (options.data) {
        try {
          dataToSend = options.contentType === 'application/x-www-form-urlencoded'
            ? CrabJsAjax.encodeFormData(options.data)
            : JSON.stringify(options.data);
        } catch (error) {
          if (options.error) {
            options.error(0, 'Error processing request data', error as Error);
          }
          return;
        }
      }

      xhr.send(dataToSend);

    } catch (error) {
      if (options.error) {
        options.error(0, 'Unexpected error occurred', error as Error);
      }
    }
  }

  /**
   * Builds a URL with query parameters
   * @param url - The base URL
   * @param params - The query parameters
   * @returns The URL with query parameters
   */
  private static buildUrlWithParams(url: string, params?: Record<string, string>): string {
    try {
      if (!params) return url;
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      return `${url}?${queryString}`;
    } catch (error) {
      throw new Error(`Error building URL parameters: ${error}`);
    }
  }

  /**
   * Encodes data as application/x-www-form-urlencoded
   * @param data - The data to encode
   * @returns The encoded data string
   */
  private static encodeFormData(data: any): string {
    try {
      if (typeof data !== 'object' || data === null) {
        throw new Error('Data must be an object');
      }
      return Object.keys(data)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&');
    } catch (error) {
      throw new Error(`Error encoding form data: ${error}`);
    }
  }
}
