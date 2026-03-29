/**
 * Output Formatter — JSON for agents, Table for humans
 * 
 * Usage:
 *   formatOutput(data, { json: true })   → JSON string
 *   formatOutput(data, { json: false })  → ASCII table
 */

/**
 * Format data as JSON string
 * @param {any} data - Data to format
 * @returns {string} Pretty-printed JSON
 */
export function toJSON(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Format array of objects as ASCII table
 * @param {Array<Object>} rows - Array of objects
 * @param {string[]} [columns] - Columns to display (default: all keys)
 * @returns {string} ASCII table string
 */
export function toTable(rows, columns) {
  if (!rows || rows.length === 0) {
    return '(no data)';
  }

  const cols = columns || Object.keys(rows[0]);
  
  // Calculate column widths
  const widths = cols.map(col => {
    const maxData = rows.reduce((max, row) => {
      const val = String(row[col] ?? '');
      return Math.max(max, val.length);
    }, 0);
    return Math.max(col.length, maxData);
  });

  // Header
  const header = cols.map((col, i) => col.padEnd(widths[i])).join(' │ ');
  const separator = widths.map(w => '─'.repeat(w)).join('─┼─');

  // Rows
  const body = rows.map(row => 
    cols.map((col, i) => String(row[col] ?? '').padEnd(widths[i])).join(' │ ')
  ).join('\n');

  return `${header}\n${separator}\n${body}`;
}

/**
 * Format output based on --json flag
 * @param {any} data - Data to format
 * @param {Object} options - Commander options
 * @param {boolean} options.json - Output as JSON
 */
export function formatOutput(data, options = {}) {
  if (options.json) {
    console.log(toJSON(data));
  } else if (Array.isArray(data)) {
    console.log(toTable(data));
  } else {
    console.log(toJSON(data));
  }
}

/**
 * Print success message
 * @param {string} message 
 * @param {Object} [options]
 */
export function success(message, options = {}) {
  if (options.json) {
    console.log(toJSON({ status: 'success', message }));
  } else {
    console.log(`✅ ${message}`);
  }
}

/**
 * Print error message
 * @param {string} message 
 * @param {Object} [options]
 */
export function error(message, options = {}) {
  if (options.json) {
    console.error(toJSON({ status: 'error', message }));
  } else {
    console.error(`❌ ${message}`);
  }
}
