# Grab Receipt Email Summarizer

An utility app to summarize your grab receipt for you to cross-check.

## Supported Countries

- Malaysia
- Indonesia

## Installation

1. Enable the gmail api based on this [guide](https://developers.google.com/gmail/api/quickstart/nodejs)
2. Download the `credentials.json` file and place it at the root of this project.
3. Add `.env` file and include following keys.

```bash
SENDGRID_API_KEY=YourSendGridApiKey
DB_URL=YourMongoDbConnectionString
```

4. Run `npm start` to retrieve grab email from your gmail and save to mongoDB
5. Run `npm run summary` to send notification email.
