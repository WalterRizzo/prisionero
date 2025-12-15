setInterval(() => {
  fetch('https://prisionero.onrender.com/health')
    .catch(err => console.log('Keeping Render alive...'));
}, 300000); // Every 5 minutes
