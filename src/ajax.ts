/**
 * Interface for AJAX request options
 */
interface Options {
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
  error?: (status: number, statusText: string) => void;
}

class CrabJsAjax {
  /**
   * Performs an AJAX request with the given options
   * @param options - The options for the AJAX request
   */
  public static ajax(options: Options): void {
    const xhr = new XMLHttpRequest();
    const urlWithParams = CrabJsAjax.buildUrlWithParams(options.url, options.params);
    xhr.open(options.method || 'GET', urlWithParams, true);

    // Set custom headers
    if (options.headers) {
      for (const key in options.headers) {
        xhr.setRequestHeader(key, options.headers[key]);
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
      xhr.responseType = options.responseType;
    }

    // Set timeout
    if (options.timeout) {
      xhr.timeout = options.timeout;
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (options.success) {
            options.success(xhr.response);
          }
        } else {
          if (options.error) {
            options.error(xhr.status, xhr.statusText);
          }
        }
      }
    };

    xhr.ontimeout = function () {
      if (options.error) {
        options.error(0, 'Request timed out');
      }
    };

    const dataToSend = options.contentType === 'application/x-www-form-urlencoded'
      ? CrabJsAjax.encodeFormData(options.data)
      : JSON.stringify(options.data);

    xhr.send(options.data ? dataToSend : null);
  }

  /**
   * Builds a URL with query parameters
   * @param url - The base URL
   * @param params - The query parameters
   * @returns The URL with query parameters
   */
  private static buildUrlWithParams(url: string, params?: Record<string, string>): string {
    if (!params) return url;
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    return `${url}?${queryString}`;
  }

  /**
   * Encodes data as application/x-www-form-urlencoded
   * @param data - The data to encode
   * @returns The encoded data string
   */
  private static encodeFormData(data: any): string {
    return Object.keys(data)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');
  }
}

// Usage example
CrabJsAjax.ajax({
  method: 'GET',
  url: 'https://api.example.com/data',
  params: { search: 'query' },
  success: (response) => {
    console.log('GET response:', response);
  },
  error: (status, statusText) => {
    console.error('GET error:', status, statusText);
  }
});

CrabJsAjax.ajax({
  method: 'POST',
  url: 'https://api.example.com/data',
  data: { key: 'value' },
  headers: { 'Custom-Header': 'value' },
  contentType: 'application/x-www-form-urlencoded',
  success: (response) => {
    console.log('POST response:', response);
  },
  error: (status, statusText) => {
    console.error('POST error:', status, statusText);
  }
}); 