#!/usr/bin/node

require('./load-env');
const fs = require('fs');
const { authorize, getEmails } = require('./google-api');
const { connect } = require('./db/connect');
const { Record } = require('./db/model');

const checkEmails = () =>
  new Promise((fulfill, reject) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) {
        console.log('Error loading client secret file:', err);
        return reject(err);
      }
      // Authorize a client with credentials, then call the Gmail API.
      authorize(JSON.parse(content), auth =>
        getEmails(auth).then(messages => {
          console.log('processed messages', messages);
          console.log('Saving...');
          Record.create(messages)
            .then(fulfill)
            .catch(reject);
        })
      );
    });
  });

async function start() {
  const db = await connect();
  await checkEmails();
  db.connection.close();
}

start();
