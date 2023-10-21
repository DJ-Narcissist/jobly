const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
const { BadRequestError } = require("../expressError");

/**
 * Generate a SQL query for a partial update operation based on the input data.
 * @param {Object} dataToUpdate - An object containing the data to be updated.
 * @param {Object} jsToSql - A mapping of JavaScript column names to their corresponding SQL column names (if different).
 * @returns {Object} - An object containing the SQL query and an array of values to be updated.
 * @throws {BadRequestError} - If no data is provided for the update.
 */




function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
