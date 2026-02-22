/**
 * Convert UNSC watchlist CSV to SQL INSERT statements
 * Run with: node supabase/convert-csv-to-sql.js
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'KYC Check', 'watchlist_keyfields.csv');
const outputPath = path.join(__dirname, 'watchlist-data.sql');

// Read CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

// Parse CSV (handle quoted fields with commas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current); // Don't forget last field

  return result;
}

// Escape SQL string
function escapeSql(str) {
  if (!str || str === 'na' || str === 'NA') return 'NULL';
  // Escape single quotes by doubling them
  const escaped = str.replace(/'/g, "''");
  return `'${escaped}'`;
}

// Get headers
const headers = parseCSVLine(lines[0]);
console.log('Headers:', headers);

// Generate SQL
let sql = `-- ============================================================
-- UNSC WATCHLIST DATA INSERT
-- Generated from watchlist_keyfields.csv
-- ============================================================

INSERT INTO watchlist_unsc (
    record_id, primary_name, alias_1, alias_2, alias_3, alias_4, alias_5,
    alias_6, alias_7, alias_8, alias_9, alias_10, dob, pob, nationality,
    passport_no, national_id, title, designation, address, listed_on,
    other_information, interpol_un_link, name_parts_raw, full_record_raw
) VALUES
`;

const values = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const fields = parseCSVLine(line);
  if (fields.length < 25) {
    console.log(`Skipping line ${i}: not enough fields (${fields.length})`);
    continue;
  }

  const row = `(
    ${escapeSql(fields[0])},  -- record_id
    ${escapeSql(fields[1])},  -- primary_name
    ${escapeSql(fields[2])},  -- alias_1
    ${escapeSql(fields[3])},  -- alias_2
    ${escapeSql(fields[4])},  -- alias_3
    ${escapeSql(fields[5])},  -- alias_4
    ${escapeSql(fields[6])},  -- alias_5
    ${escapeSql(fields[7])},  -- alias_6
    ${escapeSql(fields[8])},  -- alias_7
    ${escapeSql(fields[9])},  -- alias_8
    ${escapeSql(fields[10])}, -- alias_9
    ${escapeSql(fields[11])}, -- alias_10
    ${escapeSql(fields[12])}, -- dob
    ${escapeSql(fields[13])}, -- pob
    ${escapeSql(fields[14])}, -- nationality
    ${escapeSql(fields[15])}, -- passport_no
    ${escapeSql(fields[16])}, -- national_id
    ${escapeSql(fields[17])}, -- title
    ${escapeSql(fields[18])}, -- designation
    ${escapeSql(fields[19])}, -- address
    ${escapeSql(fields[20])}, -- listed_on
    ${escapeSql(fields[21])}, -- other_information
    ${escapeSql(fields[22])}, -- interpol_un_link
    ${escapeSql(fields[23])}, -- name_parts_raw
    ${escapeSql(fields[24])}  -- full_record_raw
  )`;

  values.push(row);
}

sql += values.join(',\n');
sql += ';\n';

// Write output
fs.writeFileSync(outputPath, sql);
console.log(`\nGenerated ${values.length} INSERT statements`);
console.log(`Output written to: ${outputPath}`);
