const test = require('node:test');
const assert = require('node:assert');

function computeDatasetSummary(name, data) {
  if (!data || data.length === 0) {
    return { rowCount: 0, columnCount: 0, columns: [], insights: [] };
  }

  const keys = Object.keys(data[0] || {});
  const rowCount = data.length;

  const columns = keys.map((key) => {
    let nullCount = 0;
    const values = data.map((row) => row[key]);
    const uniqueSet = new Set();
    let numericValues = [];

    values.forEach((v) => {
      if (v === null || v === undefined || v === '') {
        nullCount++;
      } else {
        uniqueSet.add(v);
        const num = Number(v);
        if (!isNaN(num) && typeof v !== 'boolean') {
          numericValues.push(num);
        }
      }
    });

    const isNumeric = numericValues.length > rowCount * 0.7;
    const type = isNumeric ? 'number' : 'string';

    const col = {
      name: key,
      type,
      nullCount,
      uniqueCount: uniqueSet.size,
    };

    if (type === 'number' && numericValues.length > 0) {
      col.min = Math.min(...numericValues);
      col.max = Math.max(...numericValues);
      col.mean = Number((numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2));
    }

    return col;
  });

  const insights = [
    `Dataset contains ${rowCount.toLocaleString()} records across ${keys.length} dimensions.`,
  ];

  return { rowCount, columnCount: keys.length, columns, insights };
}

test('Data Analysis: Correctly computes dataset statistics and insights', () => {
  const sampleData = [
    { product: 'Quantum A', revenue: 100, units: 10 },
    { product: 'Quantum B', revenue: 200, units: 20 },
    { product: 'Quantum C', revenue: 300, units: 30 },
  ];

  const summary = computeDatasetSummary('test.csv', sampleData);

  assert.strictEqual(summary.rowCount, 3);
  assert.strictEqual(summary.columnCount, 3);
  assert.ok(summary.insights.length > 0);

  const revenueCol = summary.columns.find((c) => c.name === 'revenue');
  assert.ok(revenueCol);
  assert.strictEqual(revenueCol.type, 'number');
  assert.strictEqual(revenueCol.min, 100);
  assert.strictEqual(revenueCol.max, 300);
  assert.strictEqual(revenueCol.mean, 200);
});
