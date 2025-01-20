/**
 * Main class for the CrabJs framework
 */
class BrowserSupport {
  public static checkFeatures(): Record<string, boolean> {
    return {
      touch: 'ontouchstart' in window,
      canvas: !!document.createElement('canvas').getContext,
      webgl: (() => {
        try {
          return !!document.createElement('canvas').getContext('webgl');
        } catch(e) {
          return false;
        }
      })(),
      cssTransitions: 'transition' in document.documentElement.style,
      cssAnimations: 'animation' in document.documentElement.style,
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch(e) {
          return false;
        }
      })()
    };
  }
}


function initPolyfills(): void {
  // RequestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 1000 / 60);
    };
  }

  // Element.matches polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches = 
      (Element.prototype as any).msMatchesSelector || 
      Element.prototype.webkitMatchesSelector;
  }

  // Element.closest polyfill
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s: string) {
      let el:Element | null = this;
      do {
        if (el.matches(s)) return el;
        el =( el.parentElement || null);
      } while (el !== null);
      return null;
    };
  }
} 

// Initialize polyfills before framework code
initPolyfills();

/**
 * Interface for animation methods
 */
interface CrabJsAnimation {
  /**
   * Fades in the elements over a specified duration
   * @param duration - The duration of the fade-in effect in milliseconds
   */
  fadeIn(duration?: number): CrabJsElementCollection;

  /**
   * Fades out the elements over a specified duration
   * @param duration - The duration of the fade-out effect in milliseconds
   */
  fadeOut(duration?: number): CrabJsElementCollection;
}

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
  error?: (status: number, statusText: string, error?: Error) => void;
}

 class CrabJsAjax {
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





// Base class must be defined before it's extended
 class CrabJsElementCollection implements CrabJsAnimation {
  private elements: HTMLElement[];
  private animation:CrabJsElementCollectionAnimation;

  constructor(elements: HTMLElement[]) {
    this.elements = elements;
    this.animation=new CrabJsElementCollectionAnimation(this);
  }

  /**
   * Applies a function to each element in the collection
   * @param callback - The function to apply to each element
   * @returns The current instance for chaining
   */
  public each(callback: (element: HTMLElement, index: number) => void): CrabJsElementCollection {
    try {
      this.elements.forEach((element, index) => callback(element, index));
    } catch (error) {
      console.error('Error in each method:', error);
    }
    return this;
  }

  /**
   * Gets the parent elements of each element in the collection
   * @returns A new CrabJsElementCollection containing the parent elements
   */
  public parent(): CrabJsElementCollection {
    const parents = Array.from(this.elements)
      .map(element => element.parentElement)
      .filter((parent): parent is HTMLElement => parent !== null);
    return new CrabJsElementCollection(parents);
  }

  /**
   * Gets parent elements until a matching selector is found
   * @param selector - The CSS selector to stop at
   * @returns A new CrabJsElementCollection containing the parent elements
   */
  public parentUntil(selector: string): CrabJsElementCollection {
    const parents: HTMLElement[] = [];
    const maxDepth = 1000; // Prevent infinite loops
    
    this.elements.forEach(element => {
      let depth = 0;
      let parent = element.parentElement;
      while (parent && !parent.matches(selector) && depth < maxDepth) {
        parents.push(parent);
        parent = parent.parentElement;
        depth++;
      }
      if (depth >= maxDepth) {
        console.warn('Maximum ancestor depth reached in parentUntil');
      }
    });
    return new CrabJsElementCollection(parents);
  }

  /**
   * Gets all child elements of each element in the collection
   * @returns A new CrabJsElementCollection containing all child elements
   */
  public children(): CrabJsElementCollection {
    const children = Array.from(this.elements)
      .reduce((acc: HTMLElement[], element) => {
        const childElements = Array.from(element.children)
          .filter((child): child is HTMLElement => child instanceof HTMLElement);
        return acc.concat(childElements);
      }, []);
    return new CrabJsElementCollection(children);
  }

  /**
   * Gets child elements until a matching selector is found
   * @param selector - The CSS selector to stop at
   * @returns A new CrabJsElementCollection containing the child elements
   */
  public childrenUntil(selector: string): CrabJsElementCollection {
    const children: HTMLElement[] = [];
    const maxChildren = 10000; // Prevent excessive memory usage
    let totalChildren = 0;

    this.elements.forEach(element => {
      Array.from(element.children).some(child => {
        if (totalChildren >= maxChildren) {
          console.warn('Maximum children limit reached in childrenUntil');
          return true;
        }
        if (child instanceof HTMLElement && !child.matches(selector)) {
          children.push(child);
          totalChildren++;
        }
        return false;
      });
    });
    return new CrabJsElementCollection(children);
  }

  /**
   * Gets the next sibling element of each element in the collection
   * @returns A new CrabJsElementCollection containing the next siblings
   */
  public next(): CrabJsElementCollection {
    const nextSiblings = Array.from(this.elements)
      .map(element => {
        let sibling = element.nextSibling;
        let depth = 0;
        const maxDepth = 100; // Prevent infinite loops
        
        while (sibling && !(sibling instanceof HTMLElement) && depth < maxDepth) {
          sibling = sibling.nextSibling;
          depth++;
        }
        return sibling instanceof HTMLElement ? sibling : null;
      })
      .filter((sibling): sibling is HTMLElement => sibling !== null);
    return new CrabJsElementCollection(nextSiblings);
  }

  /**
   * Gets next sibling elements until a matching selector is found
   * @param selector - The CSS selector to stop at
   * @returns A new CrabJsElementCollection containing the next siblings
   */
  public nextUntil(selector: string): CrabJsElementCollection {
    const siblings: HTMLElement[] = [];
    const maxSiblings = 1000; // Prevent excessive memory usage
    
    this.elements.forEach(element => {
      let sibling = element.nextSibling;
      let count = 0;
      
      while (sibling && count < maxSiblings) {
        if (sibling instanceof HTMLElement) {
          if (sibling.matches(selector)) break;
          siblings.push(sibling);
          count++;
        }
        sibling = sibling.nextSibling;
      }
      if (count >= maxSiblings) {
        console.warn('Maximum sibling limit reached in nextUntil');
      }
    });
    return new CrabJsElementCollection(siblings);
  }

  /**
   * Gets the previous sibling element of each element in the collection
   * @returns A new CrabJsElementCollection containing the previous siblings
   */
  public prev(): CrabJsElementCollection {
    const prevSiblings = Array.from(this.elements)
      .map(element => {
        let sibling = element.previousSibling;
        let depth = 0;
        const maxDepth = 100; // Prevent infinite loops
        
        while (sibling && !(sibling instanceof HTMLElement) && depth < maxDepth) {
          sibling = sibling.previousSibling;
          depth++;
        }
        return sibling instanceof HTMLElement ? sibling : null;
      })
      .filter((sibling): sibling is HTMLElement => sibling !== null);
    return new CrabJsElementCollection(prevSiblings);
  }

  /**
   * Gets previous sibling elements until a matching selector is found
   * @param selector - The CSS selector to stop at
   * @returns A new CrabJsElementCollection containing the previous siblings
   */
  public prevUntil(selector: string): CrabJsElementCollection {
    const siblings: HTMLElement[] = [];
    const maxSiblings = 1000; // Prevent excessive memory usage
    
    this.elements.forEach(element => {
      let sibling = element.previousSibling;
      let count = 0;
      
      while (sibling && count < maxSiblings) {
        if (sibling instanceof HTMLElement) {
          if (sibling.matches(selector)) break;
          siblings.push(sibling);
          count++;
        }
        sibling = sibling.previousSibling;
      }
      if (count >= maxSiblings) {
        console.warn('Maximum sibling limit reached in prevUntil');
      }
    });
    return new CrabJsElementCollection(siblings);
  }

  /**
   * Finds elements matching the selector within the current elements
   * @param selector - The CSS selector to match elements
   * @returns A new CrabJsElementCollection containing the matched elements
   */
  public find(selector: string): CrabJsElementCollection {
    const found = Array.from(this.elements)
      .reduce((acc: HTMLElement[], element) => {
        return acc.concat(
          Array.from(element.querySelectorAll(selector))
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
        );
      }, []);
    return new CrabJsElementCollection(found);
  }

  /**
   * Gets the closest ancestor that matches the selector
   * @param selector - The CSS selector to match elements
   * @returns A new CrabJsElementCollection containing the matched ancestors
   */
  public closest(selector: string): CrabJsElementCollection {
    const ancestors = Array.from(this.elements)
      .map(element => {
        // Polyfill is added in initPolyfills() for older browsers
        return element.closest(selector);
      })
      .filter((ancestor): ancestor is HTMLElement => ancestor !== null);
    return new CrabJsElementCollection(ancestors);
  }

  /**
   * Gets the first element in the collection
   * @returns A new CrabJsElementCollection containing only the first element
   */
  public first(): CrabJsElementCollection {
    return new CrabJsElementCollection(this.elements.slice(0, 1));
  }

  /**
   * Gets elements from the start until a matching selector is found
   * @param selector - The CSS selector to stop at
   * @returns A new CrabJsElementCollection containing the elements
   */
  public firstUntil(selector: string): CrabJsElementCollection {
    const elements = [];
    for (const element of this.elements) {
      if (element.matches(selector)) break;
      elements.push(element);
    }
    return new CrabJsElementCollection(elements);
  }

  /**
   * Gets the last element in the collection
   * @returns A new CrabJsElementCollection containing only the last element
   */
  public last(): CrabJsElementCollection {
    return new CrabJsElementCollection(this.elements.slice(-1));
  }

  /**
   * Gets elements from the end until a matching selector is found
   * @param selector - The CSS selector to stop at
   * @returns A new CrabJsElementCollection containing the elements
   */
  public lastUntil(selector: string): CrabJsElementCollection {
    const elements = [];
    for (let i = this.elements.length - 1; i >= 0; i--) {
      if (this.elements[i].matches(selector)) break;
      elements.unshift(this.elements[i]);
    }
    return new CrabJsElementCollection(elements);
  }

  /**
   * Adds a class to each element in the collection
   * @param className - The class name to add
   * @returns The current instance for chaining
   */
  public addClass(className: string): CrabJsElementCollection {
    try {
      this.each((element) => {
        if (element.classList) {
          element.classList.add(className);
        } else {
          const classes = element.className.split(' ');
          if (classes.indexOf(className) === -1) {
            element.className += ' ' + className;
          }
        }
      });
    } catch (error) {
      console.error('Error adding class:', error);
    }
    return this;
  }

  /**
   * Removes a class from each element in the collection
   * @param className - The class name to remove
   * @returns The current instance for chaining
   */
  public removeClass(className: string): CrabJsElementCollection {
    try {
      this.each((element) => element.classList.remove(className));
    } catch (error) {
      console.error('Error removing class:', error);
    }
    return this;
  }

  /**
   * Toggles a class on each element in the collection
   * @param className - The class name to toggle
   * @returns The current instance for chaining
   */
  public toggleClass(className: string): CrabJsElementCollection {
    try {
      this.each((element) => element.classList.toggle(className));
    } catch (error) {
      console.error('Error toggling class:', error);
    }
    return this;
  }

  /**
   * Observes changes to each element in the collection
   * @param callback - The function to call when a mutation is observed
   */
  public observe(callback: MutationCallback): void {
    try {
      this.each((element) => {
        const observer = new MutationObserver(callback);
        observer.observe(element, { attributes: true, childList: true, subtree: true });
      });
    } catch (error) {
      console.error('Error observing elements:', error);
    }
  }

  /**
   * Method to intercept method calls
   * @param methodName - The name of the method to intercept
   * @param interceptor - The function to call before the original method
   */
  public intercept(methodName: keyof CrabJsElementCollection, interceptor: Function): void {
    const originalMethod = this[methodName];
    if (typeof originalMethod === 'function') {
      this[methodName] = ((...args: any[]) => {
        interceptor(...args);
        //@ts-ignore
        return originalMethod.apply(this, args);
      }) as any;
    }
  }

  /**
   * Method to add both mouse and touch event listeners
   * @param eventType - The type of the event
   * @param callback - The callback function
   */
  public on(eventType: string, callback: EventListener): CrabJsElementCollection {
    const touchEventMap: { [key: string]: string } = {
      'click': 'touchend',
      'mousedown': 'touchstart',
      'mouseup': 'touchend',
      'mousemove': 'touchmove'
    };

    this.each((element) => {
      element.addEventListener(eventType, callback, { passive: true });
      
      // Add touch event if it exists in the map
      if (touchEventMap[eventType]) {
        element.addEventListener(touchEventMap[eventType], (e: Event) => {
          e.preventDefault();
          callback(e);
        }, { passive: false });
      }
    });
    return this;
  }

  /**
   * Method to remove an event listener from each element
   * @param eventType - The type of the event
   * @param callback - The callback function to remove
   * @returns The current instance for chaining
   */
  public off(eventType: string, callback: EventListener): CrabJsElementCollection {
    this.each((element) => element.removeEventListener(eventType, callback));
    return this;
  }

  /**
   * Fades in the elements over a specified duration
   * @param duration - The duration of the fade-in effect in milliseconds
   * @returns The current instance for chaining
   */
  fadeIn(duration: number = 400): CrabJsElementCollection {
    return this.animation.fadeIn(duration);
  }

  /**
   * Fades out the elements over a specified duration
   * @param duration - The duration of the fade-out effect in milliseconds
   * @returns The current instance for chaining
   */
  fadeOut(duration: number = 400): CrabJsElementCollection {
    return this.animation.fadeOut(duration);
  }

  /**
   * Slides in the elements from the top over a specified duration
   * @param duration - The duration of the slide-in effect in milliseconds
   * @returns The current instance for chaining
   */
  slideIn(duration: number = 400): CrabJsElementCollection {
    return this.animation.slideIn(duration);
  }

  /**
   * Slides out the elements to the top over a specified duration
   * @param duration - The duration of the slide-out effect in milliseconds
   * @returns The current instance for chaining
   */
  slideOut(duration: number = 400): CrabJsElementCollection {
    return this.animation.slideOut(duration);
  }

  /**
   * Slides the elements up or down
   * @param duration - The duration of the slide effect in milliseconds
   * @returns The current instance for chaining
   */
  slide(duration: number = 400): CrabJsElementCollection {
    return this.animation.slide(duration);
  }

  /**
   * Method to delegate an event to a child element
   * @param eventType - The type of the event
   * @param selector - The selector for the child element
   * @param callback - The callback function to execute when the event is triggered
   * @returns The current instance for chaining
   */
  public delegate(eventType: string, selector: string, callback: EventListener): CrabJsElementCollection {
    const touchEventMap: { [key: string]: string } = {
      'click': 'touchend',
      'mousedown': 'touchstart',
      'mouseup': 'touchend',
      'mousemove': 'touchmove'
    };

    const handleEvent = (event: Event) => {
      const target = event.target as Element;
      if (target && target.matches(selector)) {
        callback.call(target, event);
      }
    };

    this.each((element) => {
      element.addEventListener(eventType, handleEvent, { passive: true });
      
      if (touchEventMap[eventType]) {
        element.addEventListener(touchEventMap[eventType], (e: Event) => {
          e.preventDefault();
          handleEvent(e);
        }, { passive: false });
      }
    });
    return this;
  }

  /**
   * Method to handle an event only once
   * @param eventType - The type of the event
   * @param callback - The callback function to execute when the event is triggered
   * @returns The current instance for chaining
   */
  public one(eventType: string, callback: EventListener): CrabJsElementCollection {
    const handler = (event: Event) => {
      callback(event);
      this.off(eventType, handler);
    };
    this.on(eventType, handler);
    return this;
  }

  /**
   * Method to append an element
   * @param html - The HTML string to append
   * @returns The current instance for chaining
   */
  public append(html: string): CrabJsElementCollection {
    try {
      this.each((element) => {
        element.insertAdjacentHTML('beforeend', html);
      });
    } catch (error) {
      console.error('Error appending HTML:', error);
    }
    return this;
  }

  /**
   * Method to remove elements
   */
  public remove(): void {
    try {
      this.each((element) => {
        element.parentNode?.removeChild(element);
      });
    } catch (error) {
      console.error('Error removing elements:', error);
    }
  }

  /**
   * Gets or sets an attribute for each element in the collection
   * @param name - The name of the attribute
   * @param value - The value to set (if undefined, the method will return the attribute value of the first element)
   * @returns The current instance for chaining or the attribute value
   */
  public attr(name: string, value?: string): string | CrabJsElementCollection {
    if (value === undefined) {
      return this.elements[0]?.getAttribute(name) || '';
    }
    this.each((element) => element.setAttribute(name, value));
    return this;
  }

  /**
   * Removes an attribute from each element in the collection
   * @param name - The name of the attribute to remove
   * @returns The current instance for chaining
   */
  public removeAttr(name: string): CrabJsElementCollection {
    this.each((element) => element.removeAttribute(name));
    return this;
  }

  /**
   * Gets or sets a data attribute for each element in the collection
   * @param key - The data attribute key (without 'data-' prefix)
   * @param value - The value to set (if undefined, the method will return the data attribute value of the first element)
   * @returns The current instance for chaining or the data attribute value
   */
  public data(key: string, value?: string): string | CrabJsElementCollection {
    if (value === undefined) {
      return this.elements[0]?.dataset[key] || '';
    }
    this.each((element) => {
      element.dataset[key] = value;
    });
    return this;
  }

  /**
   * Gets or sets the HTML content of elements in the collection
   * @param content - Optional HTML content to set. If not provided, returns the HTML content of the first element
   * @returns The HTML content of the first element or the current instance for chaining
   */
  public html(content?: string): string | CrabJsElementCollection {
    if (content === undefined) {
      return this.elements[0]?.innerHTML || '';
    }
    try {
      this.each((element) => {
        element.innerHTML = content;
      });
    } catch (error) {
      console.error('Error setting HTML content:', error);
    }
    return this;
  }

  /**
   * Validates if a string is a valid email address
   * @param email - The string to validate as email
   * @param allowSubdomains - Whether to allow multiple subdomains (default: true)
   * @param maxLength - Maximum allowed length for email (default: 254)
   * @returns boolean indicating if the email is valid
   */
  public static isValidEmail(email: string, allowSubdomains: boolean = true, maxLength: number = 254): boolean {
    if (email.length > maxLength) return false;
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const subdomainEmailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return allowSubdomains ? subdomainEmailRegex.test(email) : strictEmailRegex.test(email);
  }

  /**
   * Validates if a string is a valid phone number
   * @param phone - The string to validate as phone number
   * @param allowInternational - Whether to allow international formats (default: true)
   * @param strictMode - Enforce stricter validation rules (default: false)
   * @returns boolean indicating if the phone number is valid
   */
  public static isValidPhone(phone: string, allowInternational: boolean = true, strictMode: boolean = false): boolean {
    if (strictMode) {
      const strictRegex = /^\+?(?:[0-9] ?){6,14}[0-9]$/;
      return strictRegex.test(phone);
    }
    const basicRegex = allowInternational ? /^\+?[\d\s-().]{10,}$/ : /^[\d\s-().]{10,}$/;
    return basicRegex.test(phone.trim());
  }

  /**
   * Validates if a string is a strong password
   * Must contain at least 8 characters, one uppercase, one lowercase, one number and one special character
   * @param password - The string to validate as password
   * @param minLength - Minimum length requirement (default: 8)
   * @param requireSpecial - Require special characters (default: true)
   * @param maxLength - Maximum length allowed (default: 128)
   * @returns boolean indicating if the password is strong
   */
  public static isStrongPassword(password: string, minLength: number = 8, requireSpecial: boolean = true, maxLength: number = 128): boolean {
    if (password.length < minLength || password.length > maxLength) return false;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    return hasUppercase && hasLowercase && hasNumbers && (!requireSpecial || hasSpecial);
  }

  /**
   * Validates if a string contains valid text
   * @param text - The string to validate
   * @param minLength - Minimum length required (default: 1)
   * @param maxLength - Maximum length allowed (default: 1000)
   * @param allowSpecialChars - Allow special characters (default: true)
   * @returns boolean indicating if the text is valid
   */
  public static isValidText(text: string, minLength: number = 1, maxLength: number = 1000, allowSpecialChars: boolean = true): boolean {
    const trimmedText = text.trim();
    if (trimmedText.length < minLength || trimmedText.length > maxLength) return false;
    return allowSpecialChars ? /^[\x20-\x7E]*$/.test(trimmedText) : /^[a-zA-Z0-9\s]*$/.test(trimmedText);
  }

  /**
   * Validates if a string is a valid address
   * @param address - The string to validate as address
   * @param minLength - Minimum length required (default: 5)
   * @param maxLength - Maximum length allowed (default: 200)
   * @param allowSpecialChars - Allow additional special characters (default: true)
   * @returns boolean indicating if the address is valid
   */
  public static isValidAddress(address: string, minLength: number = 5, maxLength: number = 200, allowSpecialChars: boolean = true): boolean {
    const trimmedAddress = address.trim();
    if (trimmedAddress.length < minLength || trimmedAddress.length > maxLength) return false;
    const basicRegex = /^[A-Za-z0-9\s,.-]+$/i;
    const extendedRegex = /^[A-Za-z0-9\s,.\-/#&()'"+]+$/i;
    return allowSpecialChars ? extendedRegex.test(trimmedAddress) : basicRegex.test(trimmedAddress);
  }

/**
 * Validates file type and size
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSizeKB - Maximum file size in kilobytes
 * @param minSizeKB - Minimum file size in kilobytes (default: 0)
 * @param validateName - Whether to validate filename (default: true)
 * @returns boolean indicating if the file is valid
 */
public static isValidFile(file: File, allowedTypes: string[], maxSizeKB: number, minSizeKB: number = 0, validateName: boolean = true): boolean {
  const fileSizeKB = file.size / 1024; // Convert file size to kilobytes
  if (fileSizeKB < minSizeKB || fileSizeKB > maxSizeKB) return false;

  // Check file type using indexOf instead of includes for broader browser support
  let validType = false;
  for (let i = 0; i < allowedTypes.length; i++) {
    if (allowedTypes[i] === file.type) {
      validType = true;
      break;
    }
  }
  if (!validType) return false;

  if (validateName && !/^[a-zA-Z0-9-_. ]+$/.test(file.name)) return false;
  return true;
}

  /**
   * Gets the value of an input field
   * @param trim - Whether to trim the value (default: true)
   * @param defaultValue - Default value if input is not found (default: '')
   * @returns The value of the input field
   */
  public getValue(trim: boolean = true, defaultValue: string = ''): string {
    const input = this.elements[0] as HTMLInputElement;
    if (!input || typeof input.value === 'undefined') return defaultValue;
    return trim ? input.value.trim() : input.value;
  }

  /**
   * Sets the value of input fields in the collection
   * @param value - The value to set
   * @param triggerEvent - Whether to trigger change event (default: true)
   * @param trim - Whether to trim the value before setting (default: true)
   * @returns The current instance for chaining
   */
  public setValue(value: string, triggerEvent: boolean = true, trim: boolean = true): CrabJsElementCollection {
    const finalValue = trim && typeof value === 'string' ? value.trim() : value;
    this.each((element) => {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        element.value = finalValue;
        if (triggerEvent) {
          try {
            // Modern browsers
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
          } catch (e) {
            // IE11 and older browsers
            const event = document.createEvent('Event');
            event.initEvent('change', true, true);
            element.dispatchEvent(event);
          }
        }
      }
    });
    return this;
  }

  /**
   * Gets the files from a file input
   * @param validateTypes - Array of allowed MIME types to validate (optional)
   * @param maxSize - Maximum file size to validate in bytes (optional)
   * @returns FileList or null if not a file input or validation fails
   */
  public files(validateTypes?: string[], maxSize?: number): FileList | null {
    const input = this.elements[0] as HTMLInputElement;
    if (!input || input.type !== 'file' || !input.files || !input.files.length) return null;
    
    if (validateTypes || maxSize) {
      const files = Array.from(input.files);
      const isValid = files.every(file => {
        const typeValid = !validateTypes || validateTypes.some(type => file.type === type);
        const sizeValid = !maxSize || file.size <= maxSize;
        return typeValid && sizeValid;
      });
      return isValid ? input.files : null;
    }
    
    return input.files;
  }

}
/**
 * Class to handle animations for a collection of elements
 */
class CrabJsElementCollectionAnimation implements CrabJsAnimation {
  private elementCollection: CrabJsElementCollection;

  constructor(elementCollection: CrabJsElementCollection) {
    this.elementCollection = elementCollection;
  }

  /**
   * Fades in the elements over a specified duration
   * @param duration - The duration of the fade-in effect in milliseconds
   * @returns The current instance for chaining
   */
  public fadeIn(duration: number = 400): CrabJsElementCollection {
    try {
      this.elementCollection.each((element) => {
        this.validateElementStyle(element);
        element.style.opacity = '0';
        element.style.display = element.dataset.originalDisplay || 'block';
        
        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          element.style.opacity = progress.toString();
          
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      });
    } catch (error) {
      console.error('Error during fadeIn animation:', error);
    }
    return this.elementCollection;
  }

  /**
   * Fades out the elements over a specified duration
   * @param duration - The duration of the fade-out effect in milliseconds
   * @returns The current instance for chaining
   */
  public fadeOut(duration: number = 400): CrabJsElementCollection {
    try {
      this.elementCollection.each((element) => {
        this.validateElementStyle(element);
        element.style.opacity = '1';
        // Store original display value if not already stored
        if (!element.dataset.originalDisplay) {
          element.dataset.originalDisplay = window.getComputedStyle(element).display;
        }
        
        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          element.style.opacity = (1 - progress).toString();
          
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            element.style.display = 'none';
          }
        };
        requestAnimationFrame(tick);
      });
    } catch (error) {
      console.error('Error during fadeOut animation:', error);
    }
    return this.elementCollection;
  }

  /**
   * Helper function to validate element style support
   * @param element - The DOM element to validate
   * @throws Error if element doesn't support style manipulation
   */
  private validateElementStyle(element: HTMLElement): void {
    if (!element.style) {
      throw new Error('Element does not support style manipulation');
    }
  }

  private addVendorPrefix(element: HTMLElement, property: string, value: string) {
    const prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
    prefixes.forEach(prefix => {
      element.style[prefix + property as any] = value;
    });
  }

  /**
   * Helper function to set up common slide animation properties
   * @param element - The DOM element to animate
   * @param duration - Animation duration in milliseconds
   */
  private setupSlideAnimation(element: HTMLElement, duration: number): void {
    element.style.overflow = 'hidden';
    this.addVendorPrefix(element, 'transition', `height ${duration}ms ease-in-out`);
    element.offsetHeight; // Trigger reflow
  }

  /**
   * Helper function to clean up slide animation properties
   * @param element - The DOM element to clean up
   * @param display - The display value to set after cleanup
   */
  private cleanupSlideAnimation(element: HTMLElement, display: string): void {
    element.style.height = '';
    element.style.overflow = '';
    element.style.transition = '';
    element.style.display = display;
  }

  /**
   * Slides in the elements from the top over a specified duration
   * @param duration - The duration of the slide-in effect in milliseconds
   * @returns The current instance for chaining
   */
  public slideIn(duration: number = 400): CrabJsElementCollection {
    try {
      this.elementCollection.each((element) => {
        this.validateElementStyle(element);
        
        // Store original display if not already stored
        if (!element.dataset.originalDisplay) {
          element.dataset.originalDisplay = window.getComputedStyle(element).display === 'none' ? 
            'block' : window.getComputedStyle(element).display;
        }
        
        const height = element.scrollHeight;
        element.style.height = '0px';
        element.style.display = element.dataset.originalDisplay;
        
        this.setupSlideAnimation(element, duration);
        element.style.height = `${height}px`;
        
        setTimeout(() => {
          this.cleanupSlideAnimation(element, element.dataset.originalDisplay || 'block');
        }, duration);
      });
    } catch (error) {
      console.error('Error during slideIn animation:', error);
    }
    return this.elementCollection;
  }

  /**
   * Slides out the elements to the top over a specified duration
   * @param duration - The duration of the slide-out effect in milliseconds
   * @returns The current instance for chaining
   */
  public slideOut(duration: number = 400): CrabJsElementCollection {
    try {
      this.elementCollection.each((element) => {
        this.validateElementStyle(element);
        
        // Store original display if not already stored
        if (!element.dataset.originalDisplay) {
          element.dataset.originalDisplay = window.getComputedStyle(element).display;
        }
        
        const height = element.scrollHeight;
        element.style.height = `${height}px`;
        
        this.setupSlideAnimation(element, duration);
        element.style.height = '0px';
        
        setTimeout(() => {
          this.cleanupSlideAnimation(element, 'none');
        }, duration);
      });
    } catch (error) {
      console.error('Error during slideOut animation:', error);
    }
    return this.elementCollection;
  }

  /**
   * Slides the elements up or down based on their current state
   * @param duration - The duration of the slide effect in milliseconds
   * @returns The current instance for chaining
   */
  public slide(duration: number = 400): CrabJsElementCollection {
    try {
      this.elementCollection.each((element) => {
        this.validateElementStyle(element);
        
        const isHidden = window.getComputedStyle(element).display === 'none';
        if (isHidden) {
          this.slideIn(duration);
        } else {
          this.slideOut(duration);
        }
      });
    } catch (error) {
      console.error('Error during slide animation:', error);
    }
    return this.elementCollection;
  }
}



 class CrabJs {
  /**
   * Performs an AJAX request using the CrabJsAjax class
   * @param options - The options for the AJAX request
   * 
   */
  public static ajax(options: Options) {
    return CrabJsAjax.ajax(options);
  }
  private constructor(){}

  public static init(selector:string){
    return new CrabJs().init(selector);
  }

  /**
   * Fetches elements from the DOM based on the selector
   * @param selector - The CSS selector to match elements
   * @returns A collection of matched elements
   */
  public init(selector: string):CrabJsElementCollection{
    const elements = document.querySelectorAll(selector);
    const childrens=Array.from(elements) as HTMLElement[];
    return new CrabJsElementCollection(childrens);
  }

  /**
   * Creates a CrabJsCanvas instance for a canvas element
   * @param selector - The CSS selector for the canvas element
   * @returns A CrabJsCanvas instance
   */
  public createCanvas(selector: string): CrabJsCanvas {
    return new CrabJsCanvas(selector);
  }
}


/**
 * Class to handle canvas operations
 */
class CrabJsCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(selector: string) {
    const element = document.querySelector(selector);
    if (!(element instanceof HTMLCanvasElement)) {
      throw new Error('Selector must target a canvas element');
    }
    this.canvas = element;
    this.context = this.canvas.getContext('2d')!;
    if (!this.context) {
      throw new Error('Failed to get 2D context');
    }
  }

  /**
   * Clears the entire canvas
   */
  public clear(): void {
    try {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  }

  /**
   * Draws a rectangle on the canvas
   * @param x - The x-coordinate of the rectangle's starting point
   * @param y - The y-coordinate of the rectangle's starting point
   * @param width - The width of the rectangle
   * @param height - The height of the rectangle
   * @param color - The fill color of the rectangle
   */
  public drawRect(x: number, y: number, width: number, height: number, color: string): void {
    try {
      this.context.fillStyle = color;
      this.context.fillRect(x, y, width, height);
    } catch (error) {
      console.error('Error drawing rectangle:', error);
    }
  }

  /**
   * Draws a circle on the canvas
   * @param x - The x-coordinate of the circle's center
   * @param y - The y-coordinate of the circle's center
   * @param radius - The radius of the circle
   * @param color - The fill color of the circle
   */
  public drawCircle(x: number, y: number, radius: number, color: string): void {
    try {
      this.context.fillStyle = color;
      this.context.beginPath();
      this.context.arc(x, y, radius, 0, Math.PI * 2);
      this.context.fill();
    } catch (error) {
      console.error('Error drawing circle:', error);
    }
  }

  /**
   * Draws text on the canvas
   * @param text - The text to draw
   * @param x - The x-coordinate of the text's starting point
   * @param y - The y-coordinate of the text's starting point
   * @param font - The font style of the text
   * @param color - The fill color of the text
   */
  public drawText(text: string, x: number, y: number, font: string, color: string): void {
    try {
      this.context.fillStyle = color;
      this.context.font = font;
      this.context.fillText(text, x, y);
    } catch (error) {
      console.error('Error drawing text:', error);
    }
  }

  /**
   * Draws a line between two points
   * @param x1 - The x-coordinate of the starting point
   * @param y1 - The y-coordinate of the starting point
   * @param x2 - The x-coordinate of the ending point
   * @param y2 - The y-coordinate of the ending point
   * @param color - The color of the line
   */
  public drawLine(x1: number, y1: number, x2: number, y2: number, color: string): void {
    try {
      this.context.strokeStyle = color;
      this.context.beginPath();
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
      this.context.stroke();
    } catch (error) {
      console.error('Error drawing line:', error);
    }
  }

  /**
   * Draws an image onto the canvas
   * @param image - The image element or URL to draw
   * @param x - The x-coordinate of the image's starting point
   * @param y - The y-coordinate of the image's starting point
   * @param width - The width to draw the image
   * @param height - The height to draw the image
   */
  public drawImage(image: HTMLImageElement | string, x: number, y: number, width: number, height: number): void {
    try {
      if (typeof image === 'string') {
        const img = new Image();
        img.src = image;
        img.onload = () => {
          this.context.drawImage(img, x, y, width, height);
        };
        img.onerror = () => {
          console.error('Error loading image:', image);
        };
      } else {
        this.context.drawImage(image, x, y, width, height);
      }
    } catch (error) {
      console.error('Error drawing image:', error);
    }
  }

  /**
   * Sets the stroke style for lines and shapes
   * @param color - The stroke color
   */
  public setStrokeStyle(color: string): void {
    try {
      this.context.strokeStyle = color;
    } catch (error) {
      console.error('Error setting stroke style:', error);
    }
  }

  /**
   * Sets the line width for lines and shapes
   * @param width - The line width
   */
  public setLineWidth(width: number): void {
    try {
      this.context.lineWidth = width;
    } catch (error) {
      console.error('Error setting line width:', error);
    }
  }
}



// Create the global function
const f$ = (selector: string) => CrabJs.init(selector);



// Export for module usage
export { f$ };

// Add to window object
//@ts-ignore
window.f$ = f$;
//@ts-ignore
window.CrabJs = CrabJs;

