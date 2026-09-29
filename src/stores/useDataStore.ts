import { create } from 'zustand';
import { DatasetColumn, DatasetSummary } from '@/types';

interface DataWorkspaceState {
  datasetName: string | null;
  rawData: Record<string, any>[];
  columns: DatasetColumn[];
  filteredData: Record<string, any>[];
  searchTerm: string;
  selectedXColumn: string | null;
  selectedYColumn: string | null;
  chartType: 'bar' | 'line' | 'scatter' | 'pie';
  summary: DatasetSummary | null;
  isLoading: boolean;
  error: string | null;

  setDataset: (name: string, data: Record<string, any>[]) => void;
  setSearchTerm: (term: string) => void;
  setSelectedXColumn: (col: string | null) => void;
  setSelectedYColumn: (col: string | null) => void;
  setChartType: (type: 'bar' | 'line' | 'scatter' | 'pie') => void;
  clearDataset: () => void;
}

export function computeDatasetSummary(name: string, data: Record<string, any>[]): { summary: DatasetSummary; columns: DatasetColumn[] } {
  if (!data || data.length === 0) {
    return {
      summary: {
        name,
        rowCount: 0,
        columnCount: 0,
        columns: [],
        previewRows: [],
        insights: ['No rows found in this dataset.'],
      },
      columns: [],
    };
  }

  const keys = Object.keys(data[0] || {});
  const rowCount = data.length;

  const columns: DatasetColumn[] = keys.map((key) => {
    let nullCount = 0;
    const values = data.map((row) => row[key]);
    const uniqueSet = new Set();
    let numericValues: number[] = [];

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
    const type: 'string' | 'number' | 'boolean' | 'date' = isNumeric
      ? 'number'
      : typeof values.find((v) => v !== null && v !== undefined) === 'boolean'
      ? 'boolean'
      : 'string';

    const col: DatasetColumn = {
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

  // Generate automated business insights
  const insights: string[] = [
    `Dataset contains ${rowCount.toLocaleString()} records across ${keys.length} dimensions.`,
  ];

  const highNullCols = columns.filter((c) => c.nullCount > rowCount * 0.1);
  if (highNullCols.length > 0) {
    insights.push(`Columns with >10% missing values: ${highNullCols.map((c) => c.name).join(', ')}.`);
  } else {
    insights.push(`Data hygiene is strong: no column has significant missing records.`);
  }

  const numCols = columns.filter((c) => c.type === 'number');
  if (numCols.length > 0) {
    const primary = numCols[0];
    if (primary.min !== undefined && primary.max !== undefined && primary.mean !== undefined) {
      insights.push(
        `Primary metric '${primary.name}' ranges from ${primary.min} to ${primary.max} with an average of ${primary.mean}.`
      );
    }
  }

  const summary: DatasetSummary = {
    name,
    rowCount,
    columnCount: keys.length,
    columns,
    previewRows: data.slice(0, 100),
    insights,
  };

  return { summary, columns };
}

export const useDataStore = create<DataWorkspaceState>((set, get) => ({
  datasetName: null,
  rawData: [],
  columns: [],
  filteredData: [],
  searchTerm: '',
  selectedXColumn: null,
  selectedYColumn: null,
  chartType: 'bar',
  summary: null,
  isLoading: false,
  error: null,

  setDataset: (name, data) => {
    try {
      const { summary, columns } = computeDatasetSummary(name, data);
      const numCol = columns.find((c) => c.type === 'number');
      const catCol = columns.find((c) => c.type === 'string');

      set({
        datasetName: name,
        rawData: data,
        columns,
        filteredData: data,
        searchTerm: '',
        selectedXColumn: catCol ? catCol.name : columns[0]?.name || null,
        selectedYColumn: numCol ? numCol.name : columns[1]?.name || null,
        summary,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to process dataset', isLoading: false });
    }
  },

  setSearchTerm: (term) => {
    const { rawData } = get();
    if (!term.trim()) {
      set({ searchTerm: '', filteredData: rawData });
      return;
    }
    const lower = term.toLowerCase();
    const filtered = rawData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(lower))
    );
    set({ searchTerm: term, filteredData: filtered });
  },

  setSelectedXColumn: (selectedXColumn) => set({ selectedXColumn }),
  setSelectedYColumn: (selectedYColumn) => set({ selectedYColumn }),
  setChartType: (chartType) => set({ chartType }),

  clearDataset: () =>
    set({
      datasetName: null,
      rawData: [],
      columns: [],
      filteredData: [],
      searchTerm: '',
      selectedXColumn: null,
      selectedYColumn: null,
      summary: null,
      error: null,
    }),
}));
