

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





// // Usage example
// const mclass = framework.select('.my-class');
// mclass.fadeIn(500).fadeOut(500);



// // Usage example
// CrabJsAjax.ajax({
//     method: 'GET',
//     url: 'https://api.example.com/data',
//     params: { search: 'query' },
//     success: (response) => {
//       console.log('GET response:', response);
//     },
//     error: (status, statusText) => {
//       console.error('GET error:', status, statusText);
//     }
//   });
  
//   CrabJsAjax.ajax({
//     method: 'POST',
//     url: 'https://api.example.com/data',
//     data: { key: 'value' },
//     headers: { 'Custom-Header': 'value' },
//     contentType: 'application/x-www-form-urlencoded',
//     success: (response) => {
//       console.log('POST response:', response);
//     },
//     error: (status, statusText) => {
//       console.error('POST error:', status, statusText);
//     }
//   }); 