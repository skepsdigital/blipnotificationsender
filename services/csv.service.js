const fs = require('fs');
const path = require('path');

module.exports.readCsv = (csvPath) => {
  let csvResult = null;
  let csvData = fs
    .readFileSync(path.resolve(__dirname, csvPath), {encoding: 'utf8'});
  let csvRows = csvData.split(/\r?\n/);
  let csvHeader = csvRows.splice(0, 1); // remove csv header
  let csvBody = [];
  csvRows.forEach(row => csvBody.push(row.split(';')));
  return {
    header: csvHeader,
    csvBody: csvBody
  };
} 

module.exports.generateCsv = (csvHeader, csvBody, csvPath) => {
  let csvData = '';
  csvData += csvHeader.join(',') + '\n';
  csvBody.forEach(row => {
    csvData += row.join(',') + '\n';
  });
  fs.writeFileSync(path.resolve(__dirname, csvPath), csvData, 'utf8');
}