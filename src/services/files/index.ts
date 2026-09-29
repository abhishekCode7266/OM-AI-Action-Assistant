import Papa from 'papaparse';
import { Attachment } from '@/types';

export async function processUploadedFile(file: File): Promise<Attachment> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  const isImage = file.type.startsWith('image/');

  if (isImage) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: file.name,
      type: 'image',
      mimeType: file.type || 'image/jpeg',
      size: file.size,
      dataUrl,
      uploadedAt: Date.now(),
    };
  }

  // Handle CSV / TSV
  if (fileExt === 'csv' || fileExt === 'tsv' || file.type.includes('csv')) {
    const text = await readFileAsText(file);
    const parsed = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
    const previewSummary = `CSV Rows: ${parsed.data.length}, Columns: ${parsed.meta.fields?.join(', ') || 'N/A'}`;
    return {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: file.name,
      type: 'data',
      mimeType: file.type || 'text/csv',
      size: file.size,
      textExtract: `${previewSummary}\n\nFirst 20 rows:\n${JSON.stringify(parsed.data.slice(0, 20), null, 2)}`,
      uploadedAt: Date.now(),
    };
  }

  // Handle JSON
  if (fileExt === 'json' || file.type === 'application/json') {
    const text = await readFileAsText(file);
    return {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: file.name,
      type: 'file',
      mimeType: 'application/json',
      size: file.size,
      textExtract: text.slice(0, 50000), // preserve up to 50k chars
      uploadedAt: Date.now(),
    };
  }

  // Handle Code & Text files (.txt, .md, .py, .js, .ts, .html, .css, .sql, etc.)
  const textExtensions = ['txt', 'md', 'py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'sql', 'sh', 'yaml', 'yml', 'env', 'xml', 'log'];
  if (textExtensions.includes(fileExt) || file.type.startsWith('text/')) {
    const text = await readFileAsText(file);
    return {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: file.name,
      type: 'file',
      mimeType: file.type || 'text/plain',
      size: file.size,
      textExtract: text.slice(0, 50000),
      uploadedAt: Date.now(),
    };
  }

  // Fallback generic file
  const text = await readFileAsText(file).catch(() => '');
  return {
    id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: file.name,
    type: 'file',
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    textExtract: text ? text.slice(0, 20000) : `[Binary file: ${file.name}, size: ${file.size} bytes]`,
    uploadedAt: Date.now(),
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
