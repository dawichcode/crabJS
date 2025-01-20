/**
 * Class to handle animations for a collection of elements
 */
class CrabJsElementCollectionAnimation extends CrabJsElementCollection implements CrabJsAnimation {
  // Existing methods...

  /**
   * Fades in the elements over a specified duration
   * @param duration - The duration of the fade-in effect in milliseconds
   * @returns The current instance for chaining
   */
  public fadeIn(duration: number = 400): CrabJsElementCollection {
    this.each((element) => {
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
    return this;
  }

  /**
   * Fades out the elements over a specified duration
   * @param duration - The duration of the fade-out effect in milliseconds
   * @returns The current instance for chaining
   */
  public fadeOut(duration: number = 400): CrabJsElementCollection {
    this.each((element) => {
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
    return this;
  }
  
}

// // Usage example
// const mclass = framework.select('.my-class');
// mclass.fadeIn(500).fadeOut(500); 