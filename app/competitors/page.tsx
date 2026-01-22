'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { CompetitorCard } from '@/components/CompetitorCard';
import { AddCompetitorModal } from '@/components/AddCompetitorModal';
import { Button } from '@/components/ui/button';
import { fetchCompetitors } from '@/lib/supabase/queries';
import type { CompetitorWithStats, Tag } from '@/types/database';

interface AddCompetitorForm {
  name: string;
  website: string;
  tag: Tag;
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<CompetitorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadCompetitors = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchCompetitors();
      setCompetitors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompetitors();
  }, [loadCompetitors]);

  const handleAddCompetitor = async (form: AddCompetitorForm) => {
    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          website: form.website || null,
          tag: form.tag,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create competitor');
      }

      // Reload competitors list
      await loadCompetitors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create competitor');
    }
  };

  const handleDeleteCompetitor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor? This will also delete all associated sources and claims.')) {
      return;
    }

    // Optimistic update
    const previousCompetitors = competitors;
    setCompetitors(competitors.filter(c => c.id !== id));

    try {
      const response = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete competitor');
      }
    } catch (err) {
      // Revert on error
      setCompetitors(previousCompetitors);
      alert(err instanceof Error ? err.message : 'Failed to delete competitor');
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Competitors</h1>
            <p className="text-sm text-text-secondary mt-1.5">
              Track and analyze bitcoin-backed loan competitors
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card-static animate-pulse">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-4 skeleton w-32" />
                <div className="h-5 skeleton w-14 rounded-md" />
              </div>
              <div className="h-3 skeleton w-28 mb-4" />
              <div className="flex gap-2 mb-5">
                <div className="h-6 skeleton w-20 rounded-md" />
                <div className="h-6 skeleton w-20 rounded-md" />
                <div className="h-6 skeleton w-24 rounded-md" />
              </div>
              <div className="h-10 skeleton rounded-lg" />
            </div>
          ))}
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
            <Button variant="secondary" onClick={loadCompetitors}>
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
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Competitors</h1>
          <p className="text-sm text-text-secondary mt-1.5">
            Track and analyze bitcoin-backed loan competitors
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Add Competitor
        </Button>
      </div>

      {/* Grid */}
      {competitors.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">No competitors added yet.</p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Your First Competitor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {competitors.map(competitor => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              onDelete={handleDeleteCompetitor}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddCompetitorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCompetitor}
      />
    </AuthenticatedLayout>
  );
}
