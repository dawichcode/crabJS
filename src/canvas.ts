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
  }

  /**
   * Clears the entire canvas
   */
  public clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    this.context.fillStyle = color;
    this.context.fillRect(x, y, width, height);
  }

  /**
   * Draws a circle on the canvas
   * @param x - The x-coordinate of the circle's center
   * @param y - The y-coordinate of the circle's center
   * @param radius - The radius of the circle
   * @param color - The fill color of the circle
   */
  public drawCircle(x: number, y: number, radius: number, color: string): void {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.fill();
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
    this.context.fillStyle = color;
    this.context.font = font;
    this.context.fillText(text, x, y);
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
    this.context.strokeStyle = color;
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
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
    if (typeof image === 'string') {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        this.context.drawImage(img, x, y, width, height);
      };
    } else {
      this.context.drawImage(image, x, y, width, height);
    }
  }

  /**
   * Sets the stroke style for lines and shapes
   * @param color - The stroke color
   */
  public setStrokeStyle(color: string): void {
    this.context.strokeStyle = color;
  }

  /**
   * Sets the line width for lines and shapes
   * @param width - The line width
   */
  public setLineWidth(width: number): void {
    this.context.lineWidth = width;
  }
}

