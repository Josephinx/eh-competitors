'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Download, Grid, FileText, Table, FileSpreadsheet, Check } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Competitor, Claim, Tag } from '@/types/database';
import { PRIORITY_CATEGORIES } from '@/types/database';
import { formatDateISO } from '@/lib/utils';

type ExportTab = 'investor' | 'visual' | 'fulltext' | 'csv';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitors: Competitor[];
  categories: string[];
  claims: Claim[];
}

const tabs: { id: ExportTab; label: string; icon: typeof Grid }[] = [
  { id: 'investor', label: 'Investor Summary', icon: Grid },
  { id: 'visual', label: 'Visual Table', icon: Table },
  { id: 'fulltext', label: 'Full Text', icon: FileText },
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet },
];

export function ExportModal({
  isOpen,
  onClose,
  competitors,
  categories,
  claims,
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>('investor');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedCompetitorIds, setSelectedCompetitorIds] = useState<string[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const baseline = competitors.find(c => c.is_baseline);
  const date = formatDateISO();

  // Initialize selected competitors (baseline + first 4)
  useEffect(() => {
    if (isOpen && competitors.length > 0) {
      const baselineId = baseline?.id;
      const nonBaseline = competitors.filter(c => !c.is_baseline).slice(0, 4);
      const initialSelection = [
        ...(baselineId ? [baselineId] : []),
        ...nonBaseline.map(c => c.id),
      ];
      setSelectedCompetitorIds(initialSelection);
    }
  }, [isOpen, competitors, baseline?.id]);

  // Get selected competitors in order
  const selectedCompetitors = competitors.filter(c => 
    selectedCompetitorIds.includes(c.id)
  ).sort((a, b) => {
    // Baseline first, then by original order
    if (a.is_baseline) return -1;
    if (b.is_baseline) return 1;
    return selectedCompetitorIds.indexOf(a.id) - selectedCompetitorIds.indexOf(b.id);
  });

  // Toggle competitor selection
  const toggleCompetitor = (id: string) => {
    const competitor = competitors.find(c => c.id === id);
    // Don't allow deselecting baseline
    if (competitor?.is_baseline) return;
    
    setSelectedCompetitorIds(prev => 
      prev.includes(id) 
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  // Get claim for a competitor and category
  const getClaim = (competitorId: string, category: string): Claim | undefined => {
    return claims.find(
      c => c.competitor_id === competitorId && c.category === category
    );
  };

  // Generate Investor Summary
  const generateInvestorSummary = (): string => {
    const baselineClaims = claims.filter(c => c.competitor_id === baseline?.id);
    
    let output = `COMPETITIVE POSITIONING SUMMARY\n`;
    output += `Escape Hatch vs. Bitcoin-Backed Lending Market\n`;
    output += `Generated: ${date}\n`;
    output += `${'═'.repeat(60)}\n\n`;
    
    output += `ESCAPE HATCH STRUCTURAL ADVANTAGES\n`;
    output += `${'─'.repeat(40)}\n`;
    
    for (const category of PRIORITY_CATEGORIES) {
      const claim = baselineClaims.find(c => c.category === category);
      if (claim) {
        output += `- ${claim.claim_text}\n`;
      }
    }
    
    output += `\nCORE COMPETITORS\n`;
    output += `${'─'.repeat(40)}\n`;
    
    const coreCompetitors = selectedCompetitors.filter(c => c.tag === 'core' && !c.is_baseline);
    for (const competitor of coreCompetitors) {
      output += `\n${competitor.name}\n`;
    }
    
    return output;
  };

  // Generate Full Text
  const generateFullText = (): string => {
    let output = `# Competitor Comparison Matrix\n\n`;
    output += `**Generated:** ${date}\n\n`;
    output += `## Legend\n`;
    output += `- ■ Escape Hatch baseline\n`;
    output += `- △ Priority comparison category\n`;
    output += `- ✓ Verified claim\n\n`;
    output += `---\n\n`;
    
    for (const competitor of selectedCompetitors) {
      const tagLabel = competitor.is_baseline ? 'Baseline' : competitor.tag;
      output += `## ${competitor.name} (${tagLabel})\n\n`;
      
      for (const category of categories) {
        const isPriority = PRIORITY_CATEGORIES.includes(category as typeof PRIORITY_CATEGORIES[number]);
        const priorityMark = isPriority ? ' △' : '';
        output += `### ${category}${priorityMark}\n`;
        
        const claim = claims.find(
          c => c.competitor_id === competitor.id && c.category === category
        );
        
        if (claim) {
          const verifiedMark = claim.verified ? '✓ ' : '';
          output += `${verifiedMark}${claim.claim_text}\n\n`;
        } else {
          output += `- No data\n\n`;
        }
      }
      
      output += `---\n\n`;
    }
    
    return output;
  };

  // Generate CSV
  const generateCSV = (): string => {
    const headers = [
      'competitor_name',
      'competitor_tag',
      'is_baseline',
      'category',
      'is_priority',
      'claim_text',
      'verified',
    ];
    
    const rows: string[][] = [headers];
    
    for (const competitor of selectedCompetitors) {
      for (const category of categories) {
        const claim = claims.find(
          c => c.competitor_id === competitor.id && c.category === category
        );
        const isPriority = PRIORITY_CATEGORIES.includes(category as typeof PRIORITY_CATEGORIES[number]);
        
        rows.push([
          competitor.name,
          competitor.tag,
          String(competitor.is_baseline),
          category,
          String(isPriority),
          claim?.claim_text || '',
          String(claim?.verified || false),
        ]);
      }
    }
    
    return rows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const getContent = (): string => {
    switch (activeTab) {
      case 'investor':
        return generateInvestorSummary();
      case 'fulltext':
        return generateFullText();
      case 'csv':
        return generateCSV();
      case 'visual':
        return '[Visual table preview - click Download to export as PNG]';
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    if (activeTab === 'visual') {
      // For visual, copy as HTML table
      const htmlTable = generateHTMLTable();
      await navigator.clipboard.writeText(htmlTable);
    } else {
      const content = getContent();
      await navigator.clipboard.writeText(content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate HTML table for visual export
  const generateHTMLTable = (): string => {
    let html = `<table style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px;">`;
    
    // Header row
    html += `<tr style="background: #1A1A1A;">`;
    html += `<th style="border: 1px solid #333; padding: 12px; color: #999; text-align: left; vertical-align: middle;">CATEGORY</th>`;
    for (const competitor of selectedCompetitors) {
      const badge = competitor.is_baseline 
        ? '<span style="color: #F26522; font-size: 10px; font-weight: 500;">BASELINE</span>'
        : `<span style="display: inline-flex; align-items: center; justify-content: center; background: ${competitor.tag === 'core' ? '#F26522' : competitor.tag === 'adjacent' ? '#666' : 'transparent'}; color: ${competitor.tag === 'contrast' ? '#F26522' : 'white'}; padding: 3px 8px; border-radius: 4px; font-size: 10px; text-transform: uppercase; font-weight: 500; ${competitor.tag === 'contrast' ? 'border: 1px solid #F26522;' : ''}">${competitor.tag}</span>`;
      const borderStyle = competitor.is_baseline 
        ? 'border: 1px solid #333; border-left: 2px solid #F26522; border-right: 2px solid #F26522;'
        : 'border: 1px solid #333;';
      html += `<th style="${borderStyle} padding: 12px; text-align: left; vertical-align: middle;"><div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;"><span style="color: white; font-weight: 600; text-transform: uppercase; font-size: 12px;">${competitor.name}</span>${badge}</div></th>`;
    }
    html += `</tr>`;
    
    // Data rows
    for (const category of categories) {
      const isPriority = PRIORITY_CATEGORIES.includes(category as typeof PRIORITY_CATEGORIES[number]);
      const rowBg = isPriority ? 'rgba(242, 101, 34, 0.1)' : '#242424';
      
      html += `<tr style="background: ${rowBg};">`;
      html += `<td style="border: 1px solid #333; padding: 12px; color: white; vertical-align: middle;">${isPriority ? '△ ' : ''}${category}</td>`;
      
      for (const competitor of selectedCompetitors) {
        const claim = getClaim(competitor.id, category);
        const cellBg = competitor.is_baseline ? 'rgba(242, 101, 34, 0.15)' : rowBg;
        const borderStyle = competitor.is_baseline 
          ? 'border: 1px solid #333; border-left: 2px solid #F26522; border-right: 2px solid #F26522;'
          : 'border: 1px solid #333;';
        const content = claim 
          ? `${claim.verified ? '✓ ' : ''}${claim.claim_text}`
          : '-';
        html += `<td style="${borderStyle} padding: 12px; color: ${claim ? 'white' : '#666'}; background: ${cellBg}; vertical-align: middle;">${content}</td>`;
      }
      html += `</tr>`;
    }
    
    html += `</table>`;
    return html;
  };

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      if (activeTab === 'visual') {
        // Use html2canvas for PNG export
        const html2canvas = (await import('html2canvas')).default;
        
        if (tableRef.current) {
          // Temporarily remove scroll constraints for full capture
          const originalStyle = tableRef.current.style.cssText;
          const parentEl = tableRef.current.parentElement;
          const originalParentStyle = parentEl?.style.cssText || '';
          
          // Expand to full content size
          tableRef.current.style.overflow = 'visible';
          tableRef.current.style.maxHeight = 'none';
          tableRef.current.style.width = 'auto';
          tableRef.current.style.minWidth = 'auto';
          if (parentEl) {
            parentEl.style.overflow = 'visible';
            parentEl.style.maxHeight = 'none';
          }
          
          // Wait for reflow
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const canvas = await html2canvas(tableRef.current, {
            backgroundColor: '#141414',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: tableRef.current.scrollWidth + 100,
            windowHeight: tableRef.current.scrollHeight + 100,
          });
          
          // Restore original styles
          tableRef.current.style.cssText = originalStyle;
          if (parentEl) {
            parentEl.style.cssText = originalParentStyle;
          }
          
          const url = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = url;
          a.download = `escape-hatch-comparison-${date}.png`;
          a.click();
        }
      } else {
        // Text-based exports
        const content = getContent();
        const extensions = {
          investor: 'txt',
          fulltext: 'md',
          csv: 'csv',
          visual: 'png',
        };
        const mimeTypes = {
          investor: 'text/plain',
          fulltext: 'text/markdown',
          csv: 'text/csv',
          visual: 'image/png',
        };
        
        const blob = new Blob([content], { type: mimeTypes[activeTab] });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `escape-hatch-comparison-${date}.${extensions[activeTab]}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      // Fallback for visual - download as HTML
      if (activeTab === 'visual') {
        const htmlContent = generateHTMLTable();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `escape-hatch-comparison-${date}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setDownloading(false);
    }
  };

  // Render visual table for PNG export
  const renderVisualTable = () => (
    <div 
      ref={tableRef}
      className="p-6 bg-[#141414] rounded-lg"
      style={{ display: 'inline-block', minWidth: '100%' }}
    >
      <table className="border-collapse text-xs" style={{ width: 'max-content' }}>
        <thead>
          <tr className="bg-[#1A1A1A]">
            <th className="border border-[#333] px-4 py-3 text-left text-text-muted font-semibold" style={{ minWidth: '180px' }}>
              CATEGORY
            </th>
            {selectedCompetitors.map(competitor => (
              <th 
                key={competitor.id}
                className={cn(
                  "border border-[#333] px-4 py-3 text-left align-middle",
                  competitor.is_baseline && "border-l-2 border-r-2 border-l-primary border-r-primary"
                )}
                style={{ minWidth: '200px', maxWidth: '280px', verticalAlign: 'middle' }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-xs uppercase">
                    {competitor.name}
                  </span>
                  {competitor.is_baseline ? (
                    <span className="text-primary text-[10px] font-medium">BASELINE</span>
                  ) : (
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] uppercase rounded font-medium inline-flex items-center justify-center",
                      competitor.tag === 'core' && "bg-primary text-white",
                      competitor.tag === 'adjacent' && "bg-[#666] text-white",
                      competitor.tag === 'contrast' && "border border-primary text-primary"
                    )}>
                      {competitor.tag}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map(category => {
            const isPriority = PRIORITY_CATEGORIES.includes(category as typeof PRIORITY_CATEGORIES[number]);
            
            return (
              <tr 
                key={category}
                className={isPriority ? "bg-[rgba(242,101,34,0.1)]" : "bg-[#242424]"}
              >
                <td className={cn(
                  "border border-[#333] px-4 py-3 text-white",
                  isPriority && "bg-[rgba(242,101,34,0.1)]"
                )}
                style={{ minWidth: '180px' }}
                >
                  {isPriority && <span className="text-primary mr-1">△</span>}
                  {category}
                </td>
                {selectedCompetitors.map(competitor => {
                  const claim = getClaim(competitor.id, category);
                  
                  return (
                    <td 
                      key={competitor.id}
                      className={cn(
                        "border border-[#333] px-4 py-3",
                        competitor.is_baseline && "bg-[rgba(242,101,34,0.15)] border-l-2 border-r-2 border-l-primary border-r-primary"
                      )}
                      style={{ minWidth: '200px', maxWidth: '280px' }}
                    >
                      {claim ? (
                        <span className="text-white">
                          {claim.verified && <span className="text-green-500 mr-1">✓</span>}
                          {claim.claim_text}
                        </span>
                      ) : (
                        <span className="text-[#666]">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[11px] text-text-muted mt-4 text-right">
        Generated: {date} • Escape Hatch Competitor Intelligence
      </p>
    </div>
  );

  // Non-baseline competitors for selection
  const nonBaselineCompetitors = competitors.filter(c => !c.is_baseline);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Comparison"
      description="Select competitors and export format."
    >
      {/* Competitor Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Select Competitors ({selectedCompetitors.length} selected)
          </span>
          {activeTab === 'visual' && selectedCompetitors.length > 5 && (
            <span className="text-xs text-primary">
              ⚠ Recommended: 5 or fewer for best PNG quality
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 p-3 bg-bg-app rounded-lg max-h-24 overflow-y-auto">
          {/* Baseline (always selected) */}
          {baseline && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/20 text-primary rounded text-xs border border-primary/30">
              <Check className="w-3 h-3" />
              {baseline.name}
              <span className="text-[10px] opacity-70">(baseline)</span>
            </div>
          )}
          {/* Other competitors */}
          {nonBaselineCompetitors.map(competitor => {
            const isSelected = selectedCompetitorIds.includes(competitor.id);
            return (
              <button
                key={competitor.id}
                onClick={() => toggleCompetitor(competitor.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors",
                  isSelected 
                    ? "bg-bg-card text-text-primary border border-border-light"
                    : "bg-transparent text-text-muted border border-border hover:border-border-light"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-status-success" />}
                {competitor.name}
                <span className={cn(
                  "text-[10px] px-1 rounded",
                  competitor.tag === 'core' && "bg-primary/20 text-primary",
                  competitor.tag === 'adjacent' && "bg-gray-500/20 text-gray-400",
                  competitor.tag === 'contrast' && "text-primary"
                )}>
                  {competitor.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-bg-app rounded-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                activeTab === tab.id
                  ? 'bg-bg-card text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <div className="max-h-72 overflow-auto bg-bg-app rounded-lg mb-4 scrollbar-thin">
        {activeTab === 'visual' ? (
          renderVisualTable()
        ) : (
          <pre className="whitespace-pre-wrap text-text-secondary font-mono text-xs p-4">
            {getContent()}
          </pre>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : activeTab === 'visual' ? 'Copy HTML' : 'Copy'}
        </Button>
        <Button variant="primary" onClick={handleDownload} disabled={downloading}>
          <Download className="w-4 h-4" />
          {downloading ? 'Exporting...' : activeTab === 'visual' ? 'Download PNG' : 'Download'}
        </Button>
      </div>
    </Modal>
  );
}
