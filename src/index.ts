/**
 * Main class for the CrabJs framework
 */

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

// New class to handle a collection of elements
class CrabJsElementCollection implements CrabJsAnimation {
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
    this.elements.forEach((element, index) => callback(element, index));
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
    this.each((element) => element.classList.add(className));
    return this;
  }

  /**
   * Removes a class from each element in the collection
   * @param className - The class name to remove
   * @returns The current instance for chaining
   */
  public removeClass(className: string): CrabJsElementCollection {
    this.each((element) => element.classList.remove(className));
    return this;
  }

  /**
   * Toggles a class on each element in the collection
   * @param className - The class name to toggle
   * @returns The current instance for chaining
   */
  public toggleClass(className: string): CrabJsElementCollection {
    this.each((element) => element.classList.toggle(className));
    return this;
  }

  /**
   * Observes changes to each element in the collection
   * @param callback - The function to call when a mutation is observed
   */
  public observe(callback: MutationCallback): void {
    this.each((element) => {
      const observer = new MutationObserver(callback);
      observer.observe(element, { attributes: true, childList: true, subtree: true });
    });
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
    this.each((element) => {
      element.insertAdjacentHTML('beforeend', html);
    });
    return this;
  }

  /**
   * Method to remove elements
   */
  public remove(): void {
    this.each((element) => {
      element.parentNode?.removeChild(element);
    });
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
}

const fs=(function(){
return (function(selector:string){ return CrabJs.init(selector); })
})();




// const framework = new CrabJs();
// framework.doSomething();

// // Example usage of the new select method
// const elements = framework.select('.my-class');
// elements.addClass('new-class').on('click', (event) => {
//   console.log('Element clicked:', event.currentTarget);
// }).toggleClass('active');

// // Example usage of observers
// elements.observe((mutationsList) => {
//   mutationsList.forEach((mutation) => {
//     console.log('Mutation observed:', mutation);
//   });
// });

// // Example usage of interceptors
// elements.intercept('addClass', (className) => {
//   console.log(`Intercepted addClass with className: ${className}`);
// });
// elements.addClass('another-class');

// // Example usage of event listeners
// elements.on('click', (event) => {
//   console.log('Element clicked:', event.currentTarget);
// });

// // Example usage of delegation
// elements.delegate('click', '.child-class', (event) => {
//   console.log('Child element clicked:', event.currentTarget);
// });

// // Example usage of one-time event handling
// elements.one('click', (event) => {
//   console.log('Element clicked once:', event.currentTarget);
// });

// // Example usage of appending an element
// elements.append('<div class="new-element">New Element</div>');

// // Example usage of removing elements
// elements.remove(); 

