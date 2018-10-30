const formatFn = require('date-fns/format');
const subDays = require('date-fns/sub_days');

const formatDate = date => formatFn(date, 'YYYY/MM/DD');

const getTodayDate = () => formatDate(new Date());

const getOneMonthAgoDate = () => formatDate(subDays(new Date(), 30));

/**
 *
 * @param {Array<any>} arr
 * @param {string} key
 */
const groupArrayByKey = (arr, key) =>
  arr.reduce((result, item) => {
    const value = item[key];

    if (typeof value !== 'string' && typeof value !== 'number') {
      return result;
    }

    return Array.isArray(result[value])
      ? {
          ...result,
          [value]: result[value].concat(item)
        }
      : {
          ...result,
          [value]: [item]
        };
  }, {});

module.exports = {
  getTodayDate,
  getOneMonthAgoDate,
  groupArrayByKey
};
