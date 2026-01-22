'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Plus, Trash2, Check, FileText, Quote, Link2 } from 'lucide-react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/EmptyState';
import { SourceTypeBadge, CategoryBadge } from '@/components/ui/badge';
import { ClaimDetailModal } from '@/components/ClaimDetailModal';
import { 
  fetchCompetitorById, 
  fetchSourcesByCompetitorId, 
  fetchClaimsByCompetitorId,
} from '@/lib/supabase/queries';
import type { Competitor, Source, Claim, SourceType, ClaimType } from '@/types/database';
import { CLAIM_CATEGORIES } from '@/types/database';
import { extractDomain } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompetitorDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  const [competitor, setCompetitor] = useState<Competitor | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddSource, setShowAddSource] = useState(false);
  const [showAddClaim, setShowAddClaim] = useState(false);
  
  // Source form state
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('website');
  
  // Claim form state
  const [claimText, setClaimText] = useState('');
  const [claimCategory, setClaimCategory] = useState('');
  const [claimType, setClaimType] = useState<ClaimType>('explicit');
  const [claimSourceId, setClaimSourceId] = useState('');
  const [claimSourceUrl, setClaimSourceUrl] = useState('');
  const [claimVerbatimQuote, setClaimVerbatimQuote] = useState('');
  
  // Claim detail modal state
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showClaimDetail, setShowClaimDetail] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [comp, src, clm] = await Promise.all([
        fetchCompetitorById(id),
        fetchSourcesByCompetitorId(id),
        fetchClaimsByCompetitorId(id),
      ]);
      
      setCompetitor(comp);
      setSources(src);
      setClaims(clm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitor_id: id,
          url: sourceUrl,
          source_type: sourceType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add source');
      }

      const { data: newSource } = await response.json();
      setSources([newSource, ...sources]);
      
      setSourceUrl('');
      setSourceType('website');
      setShowAddSource(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add source');
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Delete this source?')) return;

    const previousSources = sources;
    setSources(sources.filter(s => s.id !== sourceId));

    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete source');
      }
    } catch (err) {
      setSources(previousSources);
      alert(err instanceof Error ? err.message : 'Failed to delete source');
    }
  };

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitor_id: id,
          source_id: claimSourceId || null,
          category: claimCategory,
          claim_text: claimText,
          claim_type: claimType,
          source_url: claimSourceUrl || null,
          verbatim_quote: claimVerbatimQuote || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add claim');
      }

      const { data: newClaim } = await response.json();
      setClaims([newClaim, ...claims]);
      
      setClaimText('');
      setClaimCategory('');
      setClaimType('explicit');
      setClaimSourceId('');
      setClaimSourceUrl('');
      setClaimVerbatimQuote('');
      setShowAddClaim(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add claim');
    }
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (!confirm('Delete this claim?')) return;

    const previousClaims = claims;
    setClaims(claims.filter(c => c.id !== claimId));

    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete claim');
      }
    } catch (err) {
      setClaims(previousClaims);
      alert(err instanceof Error ? err.message : 'Failed to delete claim');
    }
  };

  const handleToggleVerify = async (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;

    const newVerified = !claim.verified;
    
    // Optimistic update
    setClaims(claims.map(c => 
      c.id === claimId 
        ? { ...c, verified: newVerified, verified_by: newVerified ? 'User' : null }
        : c
    ));

    try {
      const response = await fetch(`/api/claims/${claimId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified: newVerified,
          verified_by: 'User',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update verification');
      }
    } catch (err) {
      // Revert on error
      setClaims(claims.map(c => 
        c.id === claimId 
          ? { ...c, verified: claim.verified, verified_by: claim.verified_by }
          : c
      ));
      alert(err instanceof Error ? err.message : 'Failed to update verification');
    }
  };

  const handleClaimClick = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowClaimDetail(true);
  };

  const handleClaimUpdate = (updatedClaim: Claim) => {
    setClaims(claims.map(c => c.id === updatedClaim.id ? updatedClaim : c));
    setSelectedClaim(updatedClaim);
  };

  const handleClaimVerify = (claimId: string) => {
    setClaims(claims.map(c => 
      c.id === claimId ? { ...c, verified: true, verified_by: 'User' } : c
    ));
    if (selectedClaim?.id === claimId) {
      setSelectedClaim({ ...selectedClaim, verified: true, verified_by: 'User' });
    }
  };

  const sourceTypes: SourceType[] = ['website', 'whitepaper', 'press', 'social', 'other'];

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="animate-pulse">
          <div className="h-6 bg-bg-card rounded w-32 mb-4" />
          <div className="h-8 bg-bg-card rounded w-64 mb-2" />
          <div className="h-4 bg-bg-card rounded w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card h-64" />
            <div className="card h-64" />
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !competitor) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-text-secondary">{error || 'Competitor not found'}</p>
          <Link href="/competitors" className="text-primary hover:underline mt-2 inline-block">
            Back to competitors
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/competitors"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Competitors
        </Link>
        
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{competitor.name}</h1>
        {competitor.website && (
          <a
            href={competitor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mt-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
            {competitor.website}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources Panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Sources</h2>
            <Button variant="primary" size="sm" onClick={() => setShowAddSource(true)}>
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>
          
          <div className="card-static min-h-[300px]">
            {sources.length === 0 ? (
              <EmptyState
                title="No sources yet"
                description="Add URLs to extract claims from"
              />
            ) : (
              <div className="space-y-3">
                {sources.map(source => (
                  <div key={source.id} className="p-3 bg-bg-app rounded-lg group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-text-primary hover:text-primary flex items-center gap-1.5 transition-colors"
                        >
                          {extractDomain(source.url)}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                        <p className="text-xs text-text-muted truncate mt-1">
                          {source.url}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSource(source.id)}
                        className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-md transition-all duration-150 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <SourceTypeBadge type={source.source_type} className="mt-2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Claims Panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Claims</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAddClaim(true)}>
              <Plus className="w-3 h-3" />
              Add Claim
            </Button>
          </div>
          
          <div className="card-static min-h-[300px]">
            {claims.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No claims extracted yet"
                description="Add sources first, then extract claims"
              />
            ) : (
              <div className="space-y-3">
                {claims.map(claim => {
                  const source = claim.source_id 
                    ? sources.find(s => s.id === claim.source_id) 
                    : null;
                  const hasDetails = claim.source_url || claim.verbatim_quote;
                  
                  return (
                    <div 
                      key={claim.id} 
                      className="p-4 bg-bg-app rounded-lg group cursor-pointer hover:bg-bg-card-hover transition-colors"
                      onClick={() => handleClaimClick(claim)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CategoryBadge name={claim.category} />
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVerify(claim.id);
                            }}
                            className={`p-1.5 rounded-md transition-all duration-150 ${
                              claim.verified 
                                ? 'text-status-success bg-status-success/10 opacity-100' 
                                : 'text-text-muted hover:text-status-success hover:bg-status-success/10'
                            }`}
                            title={claim.verified ? 'Unverify' : 'Verify'}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClaim(claim.id);
                            }}
                            className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-md transition-all duration-150"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-text-primary leading-relaxed mb-2">{claim.claim_text}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {claim.verified && (
                          <span className="inline-flex items-center gap-1 text-xs text-status-success">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        {source && (
                          <span className="text-xs text-text-muted">
                            Source: {extractDomain(source.url)}
                          </span>
                        )}
                        {claim.source_url && (
                          <span className="inline-flex items-center gap-1 text-xs text-primary">
                            <Link2 className="w-3 h-3" />
                            URL
                          </span>
                        )}
                        {claim.verbatim_quote && (
                          <span className="inline-flex items-center gap-1 text-xs text-primary">
                            <Quote className="w-3 h-3" />
                            Quote
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Source Modal */}
      <Modal
        isOpen={showAddSource}
        onClose={() => setShowAddSource(false)}
        title="Add Source"
        description="Add a source URL to extract claims from."
      >
        <form onSubmit={handleAddSource} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Source URL
            </label>
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/article"
              type="url"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Source Type
            </label>
            <div className="flex flex-wrap gap-2">
              {sourceTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSourceType(type)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    sourceType === type
                      ? 'bg-primary text-white'
                      : 'bg-bg-card text-text-muted border border-border hover:border-border-light'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowAddSource(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Source
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Claim Modal */}
      <Modal
        isOpen={showAddClaim}
        onClose={() => setShowAddClaim(false)}
        title="Add Claim"
        description="Add a claim for this competitor."
      >
        <form onSubmit={handleAddClaim} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Category
            </label>
            <select
              value={claimCategory}
              onChange={(e) => setClaimCategory(e.target.value)}
              className="input"
              required
            >
              <option value="">Select category...</option>
              {CLAIM_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Claim Summary
            </label>
            <textarea
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="Enter the summarized claim for the matrix..."
              className="input min-h-[80px] resize-none"
              required
            />
            <p className="text-xs text-text-muted mt-1">
              This is the short version that appears in the comparison matrix.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              <span className="flex items-center gap-1.5">
                <Quote className="w-4 h-4" />
                Verbatim Quote (optional)
              </span>
            </label>
            <textarea
              value={claimVerbatimQuote}
              onChange={(e) => setClaimVerbatimQuote(e.target.value)}
              placeholder="Paste the exact quote from the source..."
              className="input min-h-[100px] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-4 h-4" />
                Source URL (optional)
              </span>
            </label>
            <Input
              type="url"
              value={claimSourceUrl}
              onChange={(e) => setClaimSourceUrl(e.target.value)}
              placeholder="https://example.com/source"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Claim Type
            </label>
            <div className="flex gap-2">
              {(['explicit', 'implied'] as ClaimType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setClaimType(type)}
                  className={`px-3 py-1 text-sm capitalize rounded-md transition-colors ${
                    claimType === type
                      ? 'bg-primary text-white'
                      : 'bg-bg-card text-text-muted border border-border'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {sources.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Link to Source (optional)
              </label>
              <select
                value={claimSourceId}
                onChange={(e) => setClaimSourceId(e.target.value)}
                className="input"
              >
                <option value="">No source linked</option>
                {sources.map(src => (
                  <option key={src.id} value={src.id}>
                    {extractDomain(src.url)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowAddClaim(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Claim
            </Button>
          </div>
        </form>
      </Modal>

      {/* Claim Detail Modal */}
      <ClaimDetailModal
        claim={selectedClaim}
        sources={sources}
        isOpen={showClaimDetail}
        onClose={() => {
          setShowClaimDetail(false);
          setSelectedClaim(null);
        }}
        onUpdate={handleClaimUpdate}
        onVerify={handleClaimVerify}
      />
    </AuthenticatedLayout>
  );
}
