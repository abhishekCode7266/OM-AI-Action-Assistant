/**
 * OM AI Assistant - Data Analytics & Science Engine
 * Parses CSV/JSON datasets, calculates descriptive statistics, extracts patterns,
 * and renders interactive SVG charts directly inside conversations.
 */

class OMDataAnalytics {
  constructor() {
    this.currentDataset = null;
  }

  parseCSV(csvText, filename = 'dataset.csv') {
    if (!csvText || typeof csvText !== 'string') {
      throw new Error("Invalid CSV text data");
    }

    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      throw new Error("Empty CSV file provided");
    }

    // Split headers respecting quotes
    const headers = this.parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const rowObj = {};
        headers.forEach((h, idx) => {
          const val = values[idx];
          // Try parse number
          if (val === "" || val === null || val === undefined) {
            rowObj[h] = null;
          } else if (!isNaN(val) && val.trim() !== '') {
            rowObj[h] = parseFloat(val);
          } else {
            rowObj[h] = val;
          }
        });
        rows.push(rowObj);
      }
    }

    // Compute column analysis
    const columnStats = {};
    headers.forEach(h => {
      const colValues = rows.map(r => r[h]);
      const nonNull = colValues.filter(v => v !== null && v !== undefined && v !== '');
      const missingCount = rows.length - nonNull.length;
      const isNumeric = nonNull.length > 0 && nonNull.every(v => typeof v === 'number');

      let stats = {
        name: h,
        type: isNumeric ? 'Numeric' : 'Categorical',
        missing: missingCount,
        missingPct: ((missingCount / rows.length) * 100).toFixed(1),
        distinct: new Set(nonNull).size
      };

      if (isNumeric) {
        const numValues = nonNull.slice().sort((a, b) => a - b);
        const sum = numValues.reduce((acc, v) => acc + v, 0);
        const mean = sum / numValues.length;
        const min = numValues[0];
        const max = numValues[numValues.length - 1];
        const median = numValues[Math.floor(numValues.length / 2)];

        stats = {
          ...stats,
          min: min,
          max: max,
          mean: parseFloat(mean.toFixed(2)),
          median: median,
          sum: parseFloat(sum.toFixed(2))
        };
      } else {
        // Frequency top items
        const freq = {};
        nonNull.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
        const topValues = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
        stats.topCategories = topValues;
      }

      columnStats[h] = stats;
    });

    const dataset = {
      filename,
      rowCount: rows.length,
      columnCount: headers.length,
      headers,
      rows: rows.slice(0, 100), // Keep sample
      stats: columnStats
    };

    this.currentDataset = dataset;
    return dataset;
  }

  parseCSVLine(line) {
    const values = [];
    let insideQuotes = false;
    let currentValue = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    return values.map(v => v.replace(/^"|"$/g, '').trim());
  }

  generateAnalysisSummary(dataset) {
    const numCols = Object.values(dataset.stats).filter(s => s.type === 'Numeric');
    const catCols = Object.values(dataset.stats).filter(s => s.type === 'Categorical');

    let summary = `### 📊 Dataset Analysis: \`${dataset.filename}\`\n\n`;
    summary += `**Overview:**\n`;
    summary += `- **Rows**: ${dataset.rowCount.toLocaleString()} records\n`;
    summary += `- **Columns**: ${dataset.columnCount} total (${numCols.length} numeric, ${catCols.length} categorical)\n`;
    summary += `- **Data Quality**: ${this.calculateDataQuality(dataset)}% complete\n\n`;

    summary += `#### 📋 Key Column Specifications & Metrics:\n`;
    summary += `| Column | Type | Distinct | Missing | Summary Metric |\n`;
    summary += `| :--- | :--- | :--- | :--- | :--- |\n`;

    Object.values(dataset.stats).slice(0, 8).forEach(col => {
      let metricStr = col.type === 'Numeric' 
        ? `Mean: **${col.mean}** (Min: ${col.min}, Max: ${col.max})` 
        : `Top: *${col.topCategories?.[0]?.[0] || 'N/A'}* (${col.topCategories?.[0]?.[1] || 0})`;
      summary += `| **${col.name}** | \`${col.type}\` | ${col.distinct} | ${col.missing} (${col.missingPct}%) | ${metricStr} |\n`;
    });

    summary += `\n#### 💡 Automated Business Insights:\n`;
    summary += `1. **Distribution**: ${numCols.length > 0 ? `\`${numCols[0].name}\` exhibits values ranging from ${numCols[0].min} to ${numCols[0].max} with an average of ${numCols[0].mean}.` : 'Even distribution across categorical groups.'}\n`;
    summary += `2. **Missing Value Impact**: ${Object.values(dataset.stats).some(s => s.missing > 0) ? 'Identified columns requiring imputation before modeling (see table above).' : 'Clean dataset with zero missing values across primary attributes.'}\n`;
    summary += `3. **Recommended Next Steps**: Run Pearson correlation matrix, engineer time-series features, and train baseline regression/classification pipeline.\n\n`;

    summary += `\`\`\`python\n# Instant Pandas Code snippet for this dataset\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv("${dataset.filename}")\nprint(df.info())\nprint(df.describe())\n\`\`\`\n`;

    return summary;
  }

  calculateDataQuality(dataset) {
    let totalCells = dataset.rowCount * dataset.columnCount;
    if (totalCells === 0) return 100;
    let missingCells = 0;
    Object.values(dataset.stats).forEach(s => { missingCells += s.missing; });
    return Math.max(0, Math.round(((totalCells - missingCells) / totalCells) * 100));
  }

  renderInlineChartSVG(dataset) {
    // Pick the best numeric column to chart
    const numCols = Object.values(dataset.stats).filter(s => s.type === 'Numeric');
    if (numCols.length === 0) return "";

    const targetCol = numCols[0];
    const sampleRows = dataset.rows.slice(0, 10);
    const labelCol = dataset.headers.find(h => dataset.stats[h].type === 'Categorical') || dataset.headers[0];

    const dataPoints = sampleRows.map((r, i) => ({
      label: String(r[labelCol] || `Item ${i+1}`).substring(0, 10),
      value: typeof r[targetCol.name] === 'number' ? r[targetCol.name] : 0
    }));

    const maxVal = Math.max(...dataPoints.map(d => d.value), 1);
    const chartHeight = 160;
    const barWidth = 32;
    const gap = 16;
    const chartWidth = Math.max(360, dataPoints.length * (barWidth + gap) + 40);

    let bars = "";
    dataPoints.forEach((d, idx) => {
      const h = Math.max(4, Math.round((d.value / maxVal) * (chartHeight - 40)));
      const x = 30 + idx * (barWidth + gap);
      const y = chartHeight - 24 - h;
      bars += `
        <g class="chart-bar-group">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="4" fill="url(#barGradient)" />
          <text x="${x + barWidth/2}" y="${y - 6}" text-anchor="middle" font-size="10" fill="#38bdf8" font-family="monospace">${d.value}</text>
          <text x="${x + barWidth/2}" y="${chartHeight - 8}" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="sans-serif">${d.label}</text>
        </g>
      `;
    });

    const svg = `
      <div class="om-inline-chart-card">
        <div class="chart-header">
          <span style="font-weight: 700; color: #fff; font-size: 0.85rem;">📊 Sample Distribution: ${targetCol.name}</span>
          <span class="badge" style="font-size: 0.7rem; background: rgba(6, 182, 212, 0.15); color: #22d3ee; padding: 2px 8px; border-radius: 6px;">Top ${dataPoints.length} Records</span>
        </div>
        <div style="overflow-x: auto; padding: 10px 0;">
          <svg viewBox="0 0 ${chartWidth} ${chartHeight}" style="width: 100%; min-width: ${chartWidth}px; height: ${chartHeight}px;">
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#06b6d4" />
                <stop offset="100%" stop-color="#6366f1" />
              </linearGradient>
            </defs>
            <line x1="20" y1="${chartHeight - 24}" x2="${chartWidth - 10}" y2="${chartHeight - 24}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
            ${bars}
          </svg>
        </div>
      </div>
    `;

    return svg;
  }
}

window.omAnalytics = new OMDataAnalytics();
