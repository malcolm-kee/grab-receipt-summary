#!/usr/bin/node

require('./load-env');
const { Parser } = require('json2csv');
const { connect } = require('./db/connect');
const { Record } = require('./db/model');
const { getOneMonthAgoDate, getTodayDate, groupArrayByKey } = require('./util');
const { sendEmail } = require('./mailer');

const getRecords = () => Record.find({ processedOn: { $gt: getOneMonthAgoDate() } });

const parser = new Parser({
  fields: ['time', 'pickup', 'dropoff', 'total']
});

const generateAttachment = records => parser.parse(records.map(record => record.toObject()));

async function generateSummary() {
  const db = await connect();
  const records = await getRecords();

  const rangeText = `${getOneMonthAgoDate()}-${getTodayDate()}`;
  const recordsGroup = groupArrayByKey(records, 'email');

  await Promise.all(
    Object.keys(recordsGroup).map(email => {
      const attachment = generateAttachment(recordsGroup[email]);
      console.log(`sending email to ${email}...`);
      return sendEmail(
        email,
        `Your Grab Summary for ${rangeText}`,
        `grab-${rangeText}.csv`,
        new Buffer(attachment).toString('base64')
      );
    })
  );

  db.connection.close();
}

generateSummary();
