'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Claim, Source } from '@/types/database';
import { ExternalLink, Quote, FileText, CheckCircle, Edit2, Save, X, Link2 } from 'lucide-react';

interface ClaimDetailModalProps {
  claim: Claim | null;
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (claim: Claim) => void;
  onVerify: (claimId: string) => void;
}

export function ClaimDetailModal({
  claim,
  sources,
  isOpen,
  onClose,
  onUpdate,
  onVerify,
}: ClaimDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClaim, setEditedClaim] = useState<Partial<Claim>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (claim) {
      setEditedClaim({
        claim_text: claim.claim_text,
        source_url: claim.source_url || '',
        verbatim_quote: claim.verbatim_quote || '',
      });
    }
    setIsEditing(false);
  }, [claim]);

  if (!claim) return null;

  const linkedSource = sources.find(s => s.id === claim.source_id);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/claims/${claim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedClaim),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update claim:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch(`/api/claims/${claim.id}/verify`, {
        method: 'POST',
      });
      if (response.ok) {
        onVerify(claim.id);
      }
    } catch (error) {
      console.error('Failed to verify claim:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Claim Details">
      <div className="space-y-6">
        {/* Category badge */}
        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
            Category
          </span>
          <p className="mt-1 text-sm text-text-primary font-medium">{claim.category}</p>
        </div>

        {/* Claim text (summary) */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-text-muted" />
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Summary Claim
            </span>
          </div>
          {isEditing ? (
            <textarea
              value={editedClaim.claim_text || ''}
              onChange={(e) => setEditedClaim({ ...editedClaim, claim_text: e.target.value })}
              className="input min-h-[80px] resize-none"
              placeholder="Enter the summarized claim..."
            />
          ) : (
            <p className="text-sm text-text-primary bg-bg-app p-3 rounded-lg">
              {claim.claim_text}
            </p>
          )}
        </div>

        {/* Verbatim quote */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Quote className="w-4 h-4 text-text-muted" />
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Verbatim Quote
            </span>
          </div>
          {isEditing ? (
            <textarea
              value={editedClaim.verbatim_quote || ''}
              onChange={(e) => setEditedClaim({ ...editedClaim, verbatim_quote: e.target.value })}
              className="input min-h-[100px] resize-none"
              placeholder="Paste the exact quote from the source..."
            />
          ) : claim.verbatim_quote ? (
            <blockquote className="text-sm text-text-secondary bg-bg-app p-4 rounded-lg border-l-2 border-primary italic">
              "{claim.verbatim_quote}"
            </blockquote>
          ) : (
            <p className="text-sm text-text-muted italic bg-bg-app p-3 rounded-lg">
              No verbatim quote added yet
            </p>
          )}
        </div>

        {/* Source URL */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-text-muted" />
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Source URL
            </span>
          </div>
          {isEditing ? (
            <input
              type="url"
              value={editedClaim.source_url || ''}
              onChange={(e) => setEditedClaim({ ...editedClaim, source_url: e.target.value })}
              className="input"
              placeholder="https://example.com/source"
            />
          ) : claim.source_url ? (
            <a
              href={claim.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors bg-bg-app p-3 rounded-lg group"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="truncate group-hover:underline">{claim.source_url}</span>
            </a>
          ) : linkedSource ? (
            <a
              href={linkedSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors bg-bg-app p-3 rounded-lg group"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="truncate group-hover:underline">{linkedSource.url}</span>
              <span className="text-text-muted text-xs">(from linked source)</span>
            </a>
          ) : (
            <p className="text-sm text-text-muted italic bg-bg-app p-3 rounded-lg">
              No source URL added yet
            </p>
          )}
        </div>

        {/* Verification status */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            {claim.verified ? (
              <span className="flex items-center gap-1.5 text-sm text-green-500">
                <CheckCircle className="w-4 h-4" />
                Verified
              </span>
            ) : (
              <span className="text-sm text-text-muted">Not verified</span>
            )}
            <span className="text-xs text-text-muted">
              • {claim.claim_type === 'explicit' ? 'Explicit claim' : 'Implied claim'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {!claim.verified && !isEditing && (
              <Button variant="ghost" size="sm" onClick={handleVerify}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Verified
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Close
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
