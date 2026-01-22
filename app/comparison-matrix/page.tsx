'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { ComparisonMatrix } from '@/components/ComparisonMatrix';
import { ExportModal } from '@/components/ExportModal';
import { ClaimDetailModal } from '@/components/ClaimDetailModal';
import { Button } from '@/components/ui/button';
import { fetchMatrixData, fetchSourcesByCompetitorId } from '@/lib/supabase/queries';
import type { Tag, Competitor, Claim, Source } from '@/types/database';
import { CLAIM_CATEGORIES } from '@/types/database';

export default function ComparisonMatrixPage() {
  const [tierFilters, setTierFilters] = useState<Tag[]>(['core', 'adjacent', 'contrast']);
  const [showExportModal, setShowExportModal] = useState(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Claim detail modal state
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [selectedSources, setSelectedSources] = useState<Source[]>([]);
  const [showClaimDetail, setShowClaimDetail] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchMatrixData(tierFilters);
      setCompetitors(data.competitors);
      setClaims(data.claims);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matrix data');
    } finally {
      setLoading(false);
    }
  }, [tierFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClaimClick = async (claim: Claim) => {
    setSelectedClaim(claim);
    setShowClaimDetail(true);
    
    // Load sources for this competitor
    try {
      const sources = await fetchSourcesByCompetitorId(claim.competitor_id);
      setSelectedSources(sources);
    } catch (err) {
      console.error('Failed to load sources:', err);
      setSelectedSources([]);
    }
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

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Comparison Matrix</h1>
            <p className="text-sm text-text-secondary mt-1">
              Compare competitors against Escape Hatch baseline
            </p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-bg-card rounded w-full mb-4" />
          <div className="h-96 bg-bg-card rounded" />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-status-error mb-4">{error}</p>
            <Button variant="secondary" onClick={loadData}>
              Retry
            </Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Comparison Matrix</h1>
          <p className="text-sm text-text-secondary mt-1">
            Compare competitors against Escape Hatch baseline
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowExportModal(true)}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Matrix */}
      <div className="h-[calc(100vh-200px)]">
        <ComparisonMatrix
          competitors={competitors}
          categories={[...CLAIM_CATEGORIES]}
          claims={claims}
          tierFilters={tierFilters}
          onTierFilterChange={setTierFilters}
          onClaimClick={handleClaimClick}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        competitors={competitors}
        categories={[...CLAIM_CATEGORIES]}
        claims={claims}
      />

      {/* Claim Detail Modal */}
      <ClaimDetailModal
        claim={selectedClaim}
        sources={selectedSources}
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
