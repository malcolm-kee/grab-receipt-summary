const fs = require('fs');
const { authorize, getEmails } = require('./google-api');

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), auth =>
    getEmails(auth).then(messages => {
      console.log('messages', messages);
    })
  );
});
