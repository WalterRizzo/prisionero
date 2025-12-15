setInterval(() => {
  const isLocalhost = window.location.hostname.includes('localhost');
  const BASE_URL = isLocalhost ? 'http://localhost:5000' : '';
  fetch(`${BASE_URL}/health`)
    .catch(err => console.log('Keeping backend alive...'));
}, 300000); // Every 5 minutes
