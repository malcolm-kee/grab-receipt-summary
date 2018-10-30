#!/usr/bin/node

require('./load-env');
const fs = require('fs');
const { authorize, getEmails, getEmailDetails, markEmailAsRead } = require('./google-api');
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
        getEmails(auth).then(messagesData =>
          Promise.all(messagesData.map(data => getEmailDetails(auth, data.id)))
            .then(messages => {
              if (messages.length > 0) {
                console.log('Saving...');
                return Record.create(messages);
              } else {
                console.log('No email processed. Ending...');
              }
            })
            .then(() => Promise.all(messagesData.map(data => markEmailAsRead(auth, data.id))))
            .then(fulfill)
            .catch(reject)
        )
      );
    });
  });

async function start() {
  const db = await connect();
  try {
    await checkEmails();
  } catch (e) {
    console.log('-Error caught in index.js start -----------------');
    console.error(e);
  } finally {
    db.connection.close();
  }
}

start();
