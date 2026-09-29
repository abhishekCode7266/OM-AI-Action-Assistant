'use client';

import React, { useRef, useState } from 'react';
import { useDataStore } from '@/stores/useDataStore';
import { useChatStore } from '@/stores/useChatStore';
import { useUIStore } from '@/stores/useUIStore';
import Papa from 'papaparse';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  FileSpreadsheet,
  Filter,
  PieChart,
  Search,
  Sparkles,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';

const SAMPLE_CSV = `Product,Category,Revenue,UnitsSold,CustomerSatisfaction,ReturnRate
Quantum Core X,Hardware,45000,120,4.8,1.2
Neural Bridge Pro,Software,89000,450,4.6,0.8
Vision Sensor V2,Hardware,31000,95,4.2,2.5
Cloud Sync SDK,Services,67000,800,4.9,0.3
Omni Tracker,Hardware,24000,150,3.9,4.1
Cyber Shield,Software,95000,600,4.7,0.5
Edge Compute Node,Hardware,52000,85,4.5,1.9
Data Pipeline CLI,Services,38000,320,4.4,1.1`;

export const DataWorkspace: React.FC = () => {
  const {
    datasetName,
    rawData,
    columns,
    filteredData,
    searchTerm,
    selectedXColumn,
    selectedYColumn,
    chartType,
    summary,
    setDataset,
    setSearchTerm,
    setSelectedXColumn,
    setSelectedYColumn,
    setChartType,
    clearDataset,
  } = useDataStore();

  const { addMessage, createNewConversation, setActiveMode } = useChatStore();
  const { setActiveTab } = useUIStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      setDataset(file.name, parsed.data as Record<string, any>[]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSample = () => {
    const parsed = Papa.parse(SAMPLE_CSV, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    setDataset('sample_product_sales.csv', parsed.data as Record<string, any>[]);
  };

  const handleAskOMForInsights = () => {
    if (!summary) return;
    const convId = createNewConversation('data-analyst', `Analysis: ${datasetName || 'Dataset'}`);
    setActiveMode('data-analyst');

    const prompt = `Here is the dataset summary for **${datasetName}**:
- Total Rows: ${summary.rowCount}
- Dimensions: ${summary.columns.map((c) => `${c.name} (${c.type})`).join(', ')}
- Detected Automated Insights:
${summary.insights.map((ins) => `  * ${ins}`).join('\n')}

Please provide a comprehensive analytical report:
1. Executive Summary & Anomalies
2. Key performance drivers and distributions
3. High-impact optimization strategies based on this data.`;

    addMessage(convId, {
      role: 'user',
      content: prompt,
      mode: 'data-analyst',
    });
    setActiveTab('chat');
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedRows = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>{datasetName || 'Data Analyst Workspace'}</span>
              {summary && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {summary.rowCount.toLocaleString()} rows
                </span>
              )}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.json"
            className="hidden"
            onChange={handleFileUpload}
          />

          {!datasetName ? (
            <>
              <button
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                Load Sample Data
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleAskOMForInsights}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask OM for Insights</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Upload another dataset"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={clearDataset}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                title="Clear dataset"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!datasetName ? (
        /* Empty Dropzone Hero */
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Import Your Dataset</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload CSV or JSON files to generate immediate statistical profiles, distribution
                charts, and AI business insights.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
              >
                Browse Files
              </button>
              <button
                onClick={handleLoadSample}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                Try Sample Data
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Full Data Explorer Layout */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Data Table & Summary Statistics */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="p-3 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="text-xs text-slate-400">
                Showing {filteredData.length} records
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.name} className="p-2.5 font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{col.name}</span>
                          <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400 font-mono">
                            {col.type}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {paginatedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                      {columns.map((col) => (
                        <td key={col.name} className="p-2.5 whitespace-nowrap font-mono text-[11px]">
                          {row[col.name] !== null && row[col.name] !== undefined
                            ? String(row[col.name])
                            : <span className="text-slate-600 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-2.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1 rounded bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Charts & Automated Insights Panel */}
          <div className="w-full lg:w-96 p-4 bg-slate-900/40 overflow-y-auto space-y-4 shrink-0">
            {/* Automated Insights Box */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-blue-300 uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Automated Insights</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {summary?.insights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Chart Generator */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Interactive Visualization</span>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      chartType === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      chartType === 'line' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>

              {/* Dimension Selectors */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">X-Axis (Category)</label>
                  <select
                    value={selectedXColumn || ''}
                    onChange={(e) => setSelectedXColumn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-slate-200 text-xs"
                  >
                    {columns.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Y-Axis (Metric)</label>
                  <select
                    value={selectedYColumn || ''}
                    onChange={(e) => setSelectedYColumn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-slate-200 text-xs"
                  >
                    {columns.filter((c) => c.type === 'number').map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Render SVG Chart */}
              <div className="w-full h-48 bg-slate-950/80 rounded-xl p-2 border border-slate-800 flex items-center justify-center">
                {renderSvgChart(rawData, selectedXColumn, selectedYColumn, chartType)}
              </div>
            </div>

            {/* Column Metric Summary Cards */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Column Distributions
              </span>
              {columns.map((c) => (
                <div key={c.name} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.type}</span>
                  </div>
                  {c.type === 'number' && c.min !== undefined && (
                    <div className="grid grid-cols-3 text-[10px] text-slate-400 font-mono pt-1">
                      <div>Min: {c.min}</div>
                      <div>Avg: {c.mean}</div>
                      <div>Max: {c.max}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderSvgChart(
    data: Record<string, any>[],
    xCol: string | null,
    yCol: string | null,
    type: 'bar' | 'line' | 'scatter' | 'pie'
  ) {
    if (!xCol || !yCol || data.length === 0) {
      return <span className="text-xs text-slate-500">Select numeric metrics to view chart</span>;
    }

    const chartData = data.slice(0, 8).map((d) => ({
      label: String(d[xCol] || '').slice(0, 8),
      val: Number(d[yCol]) || 0,
    }));

    const maxVal = Math.max(...chartData.map((d) => d.val), 1);
    const svgWidth = 320;
    const svgHeight = 160;
    const padding = 20;

    if (type === 'line') {
      const points = chartData.map((d, i) => {
        const x = padding + (i / (chartData.length - 1 || 1)) * (svgWidth - padding * 2);
        const y = svgHeight - padding - (d.val / maxVal) * (svgHeight - padding * 2);
        return `${x},${y}`;
      }).join(' ');

      return (
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
          <polyline fill="none" stroke="#3888ff" strokeWidth="2.5" points={points} />
          {chartData.map((d, i) => {
            const x = padding + (i / (chartData.length - 1 || 1)) * (svgWidth - padding * 2);
            const y = svgHeight - padding - (d.val / maxVal) * (svgHeight - padding * 2);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="3.5" fill="#3888ff" />
                <text x={x} y={svgHeight - 4} fontSize="8" fill="#94a3b8" textAnchor="middle">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }

    // Default Bar Chart
    const barWidth = (svgWidth - padding * 2) / chartData.length - 6;
    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
        {chartData.map((d, i) => {
          const x = padding + i * (barWidth + 6);
          const barHeight = (d.val / maxVal) * (svgHeight - padding * 2);
          const y = svgHeight - padding - barHeight;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                fill="#3888ff"
                rx="3"
                className="hover:fill-blue-400 transition-colors"
              />
              <text x={x + barWidth / 2} y={svgHeight - 4} fontSize="8" fill="#94a3b8" textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
};
