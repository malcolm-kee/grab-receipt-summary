const format = require('date-fns/format');

const getTodayDate = () => format(new Date(), 'YYYY/MM/DD');

module.exports = {
  getTodayDate
};
