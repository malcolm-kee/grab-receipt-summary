const ch = require('cheerio');

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
      dropoff: getDropoffLocation(html)
    }))[0];
}

function getTotal(html) {
  const $ = ch.load(html);
  return $('tr span')
    .filter(function() {
      return (
        $(this)
          .text()
          .includes('RM') &&
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
        .includes('Pick-up time');
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
        .includes('Pick up location:');
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
        .includes('Drop off location:');
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