const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');
const { extractData } = require('./parser');

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
];
const TOKEN_PATH = path.resolve(__dirname, 'token.json');

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client `credentials.`
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const getEmailDetails = (auth, id) =>
  new Promise((fulfill, reject) => {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.get(
      {
        id,
        userId: 'me',
        format: 'full'
      },
      (err, res) => {
        if (err) return reject(err);

        const data = extractData(res.data);
        fulfill(data);
      }
    );
  });

/**
 * Mark the message as read
 *
 * @param {google.auth.OAuth2} auth
 * @param {string} id
 */
const markEmailAsRead = (auth, id) =>
  new Promise((fulfill, reject) => {
    const gmail = google.gmail({ version: 'v1', auth });

    gmail.users.messages.modify(
      {
        id,
        userId: 'me',
        resource: {
          removeLabelIds: ['UNREAD']
        }
      },
      err => {
        if (err) {
          console.log('API error: ', err);
          return reject(err);
        }
        console.log('Successfully mark message as read.');
        fulfill();
      }
    );
  });

/**
 * Get all the unread messages with "grab" in the subject
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const getEmails = auth =>
  new Promise((fulfill, reject) => {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list(
      {
        userId: 'me',
        q: `label:unread subject:grab`
      },
      (err, res) => {
        if (err) {
          console.log('API error: ', err);
          return reject(err);
        }
        console.log('Number of emails returned:', res.data.resultSizeEstimate);
        if (res.data.resultSizeEstimate > 0 && Array.isArray(res.data.messages)) {
          fulfill(res.data.messages);
        } else {
          fulfill([]);
        }
      }
    );
  });

module.exports = {
  authorize,
  getEmails,
  getEmailDetails,
  markEmailAsRead
};
