import { CrabJsElementCollection } from "..";

/**
 * Interface for animation methods
 */
export interface CrabJsAnimation {
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