'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { CLAIM_CATEGORIES } from '@/types/database';

const requiredColumns = [
  'competitor_name',
  'source_url',
  'source_type',
  'claim_category',
  'claim_text',
  'claim_type',
];

const optionalColumns = [
  'competitor_website',
  'competitor_tag',
  'citation',
  'internal_note',
];

const sourceTypeValues = ['website', 'whitepaper', 'press', 'social', 'other'];
const claimTypeValues = ['explicit', 'implied'];
const tagValues = ['core', 'adjacent', 'contrast'];

export default function ImportCSVPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<{
    competitors_created: number;
    competitors_existing: number;
    sources_created: number;
    claims_created: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setErrors([]);
    setSuccess(false);
    setStats(null);
    setImporting(true);

    try {
      const response = await fetch('/api/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv_content: csvContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          setErrors(data.details);
        } else {
          setErrors([data.error || 'Import failed']);
        }
        return;
      }

      setSuccess(true);
      setStats(data.stats);
      
      // Clear form after success
      setTimeout(() => {
        setCsvContent('');
        setFileName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 5000);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Import failed']);
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    setCsvContent('');
    setFileName('');
    setErrors([]);
    setSuccess(false);
    setStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const placeholderCSV = 'competitor_name,competitor_website,competitor_tag,source_url,source_type,claim_category,claim_text,claim_type,citation,internal_note';

  return (
    <AuthenticatedLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Import CSV</h1>
        <p className="text-sm text-text-secondary mt-1">
          Bulk import competitors, sources, and claims from CSV data
        </p>
      </div>

      {/* Schema Documentation */}
      <div className="card mb-6">
        <h2 className="text-lg font-medium text-primary mb-4">CSV Schema</h2>
        <p className="text-sm text-text-secondary mb-4">
          Your CSV must include these column headers exactly as shown. Duplicate rows (same competitor + category + claim_text) will be skipped.
        </p>

        <div className="mb-4">
          <p className="text-sm font-medium text-text-secondary mb-2">Required columns</p>
          <div className="flex flex-wrap gap-2">
            {requiredColumns.map(col => (
              <span key={col} className="px-2 py-1 text-xs font-mono bg-bg-app rounded text-text-primary">
                {col}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-text-secondary mb-2">Optional columns</p>
          <div className="flex flex-wrap gap-2">
            {optionalColumns.map(col => (
              <span key={col} className="px-2 py-1 text-xs font-mono bg-bg-app rounded text-text-muted">
                {col}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="font-medium text-text-secondary mb-2">Valid source_type values</p>
            <ul className="space-y-1 text-text-muted">
              {sourceTypeValues.map(v => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-text-secondary mb-2">Valid claim_type values</p>
            <ul className="space-y-1 text-text-muted">
              {claimTypeValues.map(v => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-text-secondary mb-2">Valid competitor_tag values</p>
            <ul className="space-y-1 text-text-muted">
              {tagValues.map(v => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-text-secondary mb-2">Valid claim_category values</p>
            <div className="max-h-[200px] overflow-y-auto scrollbar-thin">
              <ul className="space-y-1 text-text-muted">
                {CLAIM_CATEGORIES.map(c => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h2 className="text-lg font-medium text-text-primary mb-2">Upload or Paste CSV</h2>
        <p className="text-sm text-text-secondary mb-6">
          Upload a CSV file or paste CSV content directly
        </p>

        {/* File Upload */}
        <div className="mb-6">
          <p className="text-sm font-medium text-text-secondary mb-2">Upload CSV file</p>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Choose File
            </Button>
            {fileName && (
              <span className="text-sm text-text-secondary">{fileName}</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-text-muted uppercase">Or Paste CSV</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Textarea */}
        <div className="mb-6">
          <p className="text-sm font-medium text-text-secondary mb-2">Paste CSV content</p>
          <textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder={placeholderCSV}
            className="input min-h-[200px] font-mono text-xs resize-none"
          />
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
            <p className="text-sm font-medium text-status-error mb-2">Validation Errors</p>
            <ul className="text-xs text-status-error space-y-1 max-h-32 overflow-y-auto">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success */}
        {success && stats && (
          <div className="mb-6 p-4 bg-status-success/10 border border-status-success/30 rounded-lg">
            <p className="text-sm font-medium text-status-success mb-2">
              CSV imported successfully!
            </p>
            <ul className="text-xs text-status-success space-y-1">
              <li>Competitors created: {stats.competitors_created}</li>
              <li>Competitors existing: {stats.competitors_existing}</li>
              <li>Sources created: {stats.sources_created}</li>
              <li>Claims created: {stats.claims_created}</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={!csvContent.trim() || importing}
          >
            {importing ? 'Importing...' : 'Import CSV'}
          </Button>
          <Button variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
