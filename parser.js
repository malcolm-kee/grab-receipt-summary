const ch = require('cheerio');
const { getTodayDate } = require('./util');

/**
 *
 * Extract the following info from the response
 * - email - done
 * - datetime - done
 * - total paid - done
 * - pick up - done
 * - drop off - done
 * - ride fare - NOT IMPLEMENTED
 * - toll - NOT IMPLEMENTED
 */
function extractData(message) {
  const email = message.payload.headers
    .filter(header => header.name === 'From')
    .map(header => header.value)[0];
  return message.payload.parts
    .filter(part => part.mimeType === 'text/html')
    .map(part => new Buffer(part.body.data, 'base64').toString('utf8'))
    .map(html => ({
      total: getTotal(html),
      time: getPickupTime(html),
      email,
      pickup: getPickupLocation(html),
      dropoff: getDropoffLocation(html),
      processedOn: getTodayDate()
    }))[0];
}

function getTotal(html) {
  const $ = ch.load(html);
  return $('tr span')
    .filter(function() {
      return (
        $(this)
          .text()
          .match(/RM|RP/) &&
        $(this)
          .parent()
          .text()
          .includes('TOTAL')
      );
    })
    .map(getText)
    .get(0);
}

function getPickupTime(html) {
  const $ = ch.load(html);
  return $('td span')
    .filter(function() {
      return $(this)
        .parent()
        .text()
        .match(/Pick-up time|WAKTU/);
    })
    .map(getText)
    .get(0);
}

function getPickupLocation(html) {
  const $ = ch.load(html);
  return $('td span')
    .filter(function() {
      return $(this)
        .text()
        .match(/Pick up location:|Lokasi Penjemputan:/);
    })
    .siblings('span')
    .map(getText)
    .get(0);
}

function getDropoffLocation(html) {
  const $ = ch.load(html);
  return $('td span')
    .filter(function() {
      return $(this)
        .text()
        .match(/Drop off location:|Lokasi Tujuan:/);
    })
    .siblings('span')
    .map(getText)
    .get(0);
}

function getText() {
  return ch(this)
    .text()
    .trim();
}

module.exports = {
  extractData
};
