# CrabJS

CrabJS is a lightweight, modern JavaScript framework designed to simplify DOM manipulation, AJAX requests, and canvas operations. It provides a jQuery-like API with modern TypeScript support and built-in features for animations, event handling, and canvas manipulation.

## Features

- 🚀 Modern ES2015+ JavaScript with TypeScript support
- 🎨 Advanced DOM manipulation and traversal
- 🔄 Built-in animations (fade, slide)
- 📡 AJAX request handling
- 🎨 Canvas drawing utilities
- 📱 Touch event support
- ✨ Chainable API
- 🔍 Element selection and filtering
- 🎯 Event delegation
- 📝 Form handling
- 🖼️ Image manipulation

## Installation
```bash
npm install crabjs
```

## Quick Start

```html
<script type="module">
import { f$ } from 'crabjs';
// Use the f$ function to select elements
f$('.my-element').fadeIn(500);
</script>
```

## Core Features

### Element Selection

```javascript
// Select elements
const elements = f$('.my-class');

// Traverse DOM
elements.parent();
elements.children();
elements.next();
elements.prev();
elements.find('.child');
```

**Note:** CrabJS is designed to be lightweight and efficient, so it avoids unnecessary DOM traversal and manipulation.

### DOM Manipulation

```javascript
f$('.element')
    .addClass('new-class')
    .removeClass('old-class')
    .toggleClass('active');
```

### Event Handling

```javascript
f$('.button')
    .on('click', (event) => {
        console.log('Clicked!');
    })
    .delegate('click', '.child', (event) => {
        console.log('Child clicked!');
    });
```

### Animations

```javascript
// Fade effects
f$('.element').fadeIn(400);
f$('.element').fadeOut(400);

// Slide effects
f$('.element').slideIn(400);
f$('.element').slideOut(400);
```

### AJAX Requests

```javascript
CrabJs.ajax({
    url: 'https://api.example.com/data',
    method: 'POST',
    data: { key: 'value' },
    success: (response) => {
        console.log('Success:', response);
    },
    error: (status, message) => {
        console.error('Error:', message);
    }
});
```

### Canvas Operations

```javascript
const canvas = new CrabJs().createCanvas('#myCanvas');
canvas.drawRect(10, 10, 100, 100, 'red');
canvas.drawCircle(50, 50, 25, 'blue');
canvas.drawText('Hello', 10, 10, '20px Arial', 'black');
```

### Form Handling

```javascript
// Get input value
const value = f$('input').getValue();

// Set input value
f$('input').setValue('new value');

// Handle file inputs
const files = f$('input[type="file"]').files();
```

### Validation Utilities

```javascript
// Email validation
CrabJs.isValidEmail('test@example.com');

// File validation
CrabJs.isValidFile(file, ['image/jpeg'], 5000);

// Address validation
CrabJs.isValidAddress('123 Main St');
```

## Browser Support

Supports all modern browsers and includes polyfills for older browser compatibility.

## License

ISC License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


