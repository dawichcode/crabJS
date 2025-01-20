import { CrabJsElementCollection } from ".";
import { CrabJsAnimation } from "./interface/CrabJSAnimation";

/**
 * Class to handle animations for a collection of elements
 */
export class CrabJsElementCollectionAnimation extends CrabJsElementCollection implements CrabJsAnimation {
  
  /**
   * Fades in the elements over a specified duration
   * @param duration - The duration of the fade-in effect in milliseconds
   * @returns The current instance for chaining
   */
  public fadeIn(duration: number = 400): CrabJsElementCollection {
    try {
      this.each((element) => {
        this.validateElementStyle(element);
        element.style.opacity = '0';
        element.style.display = 'block';
        let last = +new Date();
        const tick = () => {
          element.style.opacity = (parseFloat(element.style.opacity) + (new Date().getTime() - last) / duration).toString();
          last = +new Date();
          if (parseFloat(element.style.opacity) < 1) {
            //@ts-ignore
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
          }
        };
        tick();
      });
    } catch (error) {
      console.error('Error during fadeIn animation:', error);
    }
    return this;
  }

  /**
   * Fades out the elements over a specified duration
   * @param duration - The duration of the fade-out effect in milliseconds
   * @returns The current instance for chaining
   */
  public fadeOut(duration: number = 400): CrabJsElementCollection {
    try {
      this.each((element) => {
       this.validateElementStyle(element);
        element.style.opacity = '1';
        let last = +new Date();
        const tick = () => {
          element.style.opacity = (parseFloat(element.style.opacity) - (new Date().getTime() - last) / duration).toString();
          last = +new Date();
          if (parseFloat(element.style.opacity) > 0) {
            //@ts-ignore
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
          } else {
            element.style.display = 'none';
          }
        };
        tick();
      });
    } catch (error) {
      console.error('Error during fadeOut animation:', error);
    }
    return this;
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

  /**
   * Helper function to set up common slide animation properties
   * @param element - The DOM element to animate
   * @param duration - Animation duration in milliseconds
   */
  private setupSlideAnimation(element: HTMLElement, duration: number): void {
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease-in-out`;
    // Trigger reflow
    element.offsetHeight;
  }

  /**
   * Helper function to clean up slide animation properties
   * @param element - The DOM element to clean up
   * @param display - The display value to set after cleanup
   */
  private cleanupSlideAnimation(element:HTMLElement, display: string): void {
    element.style.height = 'auto';
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
      this.each((element) => {
        this.validateElementStyle(element);
        
        const height = element.offsetHeight;
        element.style.height = '0px';
        element.style.display = 'block';
        
        this.setupSlideAnimation(element, duration);
        element.style.height = `${height}px`;
        
        setTimeout(() => {
          this.cleanupSlideAnimation(element, 'block');
        }, duration);
      });
    } catch (error) {
      console.error('Error during slideIn animation:', error);
    }
    return this;
  }

  /**
   * Slides out the elements to the top over a specified duration
   * @param duration - The duration of the slide-out effect in milliseconds
   * @returns The current instance for chaining
   */
  public slideOut(duration: number = 400): CrabJsElementCollection {
    try {
      this.each((element) => {
        this.validateElementStyle(element);
        
        const height = element.offsetHeight;
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
    return this;
  }

  /**
   * Slides the elements up or down based on their current state
   * @param duration - The duration of the slide effect in milliseconds
   * @returns The current instance for chaining
   */
  public slide(duration: number = 400): CrabJsElementCollection {
    try {
      this.each((element) => {
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
    return this;
  }
}
 