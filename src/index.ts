/**
 * Main class for the CrabJs framework
 */

import { CrabJsAjax, Options } from "./ajax";
import { CrabJsElementCollectionAnimation } from "./animation";
import { CrabJsCanvas } from "./canvas";
import { CrabJsAnimation } from "./interface/CrabJSAnimation";

export class CrabJs {
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

// New class to handle a collection of elements
export class CrabJsElementCollection implements CrabJsAnimation {
  private elements: HTMLElement[];
  private animation:CrabJsElementCollectionAnimation;

  constructor(elements: HTMLElement[]) {
    this.elements = elements;
    this.animation=new CrabJsElementCollectionAnimation(elements);
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
   * Gets all child elements of each element in the collection
   * @returns A new CrabJsElementCollection containing all child elements
   */
  public children(): CrabJsElementCollection {
    const children = Array.from(this.elements)
      .flatMap(element => Array.from(element.children))
      .filter((child): child is HTMLElement => child instanceof HTMLElement);
    return new CrabJsElementCollection(children);
  }

  /**
   * Gets the next sibling element of each element in the collection
   * @returns A new CrabJsElementCollection containing the next siblings
   */
  public next(): CrabJsElementCollection {
    const nextSiblings = Array.from(this.elements)
      .map(element => element.nextElementSibling)
      .filter((sibling): sibling is HTMLElement => sibling !== null);
    return new CrabJsElementCollection(nextSiblings);
  }

  /**
   * Gets the previous sibling element of each element in the collection
   * @returns A new CrabJsElementCollection containing the previous siblings
   */
  public prev(): CrabJsElementCollection {
    const prevSiblings = Array.from(this.elements)
      .map(element => element.previousElementSibling)
      .filter((sibling): sibling is HTMLElement => sibling !== null);
    return new CrabJsElementCollection(prevSiblings);
  }

  /**
   * Finds elements matching the selector within the current elements
   * @param selector - The CSS selector to match elements
   * @returns A new CrabJsElementCollection containing the matched elements
   */
  public find(selector: string): CrabJsElementCollection {
    const found = Array.from(this.elements)
      .flatMap(element => Array.from(element.querySelectorAll(selector)))
      .filter((element): element is HTMLElement => element !== null);
    return new CrabJsElementCollection(found);
  }

  /**
   * Gets the closest ancestor that matches the selector
   * @param selector - The CSS selector to match elements
   * @returns A new CrabJsElementCollection containing the matched ancestors
   */
  public closest(selector: string): CrabJsElementCollection {
    const ancestors = Array.from(this.elements)
      .map(element => element.closest(selector))
      .filter((ancestor): ancestor is HTMLElement => ancestor !== null);
    return new CrabJsElementCollection(ancestors);
  }

  /**
   * Adds a class to each element in the collection
   * @param className - The class name to add
   * @returns The current instance for chaining
   */
  public addClass(className: string): CrabJsElementCollection {
    try {
      this.each((element) => element.classList.add(className));
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
   * Method to add an event listener to each element
   * @param eventType - The type of the event
   * @param callback - The callback function to execute when the event is triggered
   * @returns The current instance for chaining
   */
  public on(eventType: string, callback: EventListener): CrabJsElementCollection {
    this.each((element) => element.addEventListener(eventType, callback));
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
    this.each((element) => {
      element.addEventListener(eventType, (event) => {
        const target = event.target as Element;
        if (target && target.matches(selector)) {
          callback.call(target, event);
        }
      });
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
public static isValidFile(file: File,allowedTypes: string[],maxSizeKB: number,minSizeKB: number = 0,validateName: boolean = true): boolean {
  const fileSizeKB = file.size / 1024; // Convert file size to kilobytes
  if (fileSizeKB < minSizeKB || fileSizeKB > maxSizeKB) return false;
  if (!allowedTypes.includes(file.type)) return false;
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
    if (!input?.value) return defaultValue;
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
    const finalValue = trim ? value.trim() : value;
    this.each((element) => {
      if (element instanceof HTMLInputElement) {
        element.value = finalValue;
        if (triggerEvent) {
          const event = new Event('change', { bubbles: true });
          element.dispatchEvent(event);
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
    if (input?.type !== 'file' || !input.files) return null;
    
    if (validateTypes || maxSize) {
      const files = Array.from(input.files);
      const isValid = files.every(file => 
        (!validateTypes || validateTypes.includes(file.type)) &&
        (!maxSize || file.size <= maxSize)
      );
      return isValid ? input.files : null;
    }
    
    return input.files;
  }
}

const fs=(function(){
return (function(selector:string){ return CrabJs.init(selector); })
})();


