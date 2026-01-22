'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Tag } from '@/types/database';
import { cn } from '@/lib/utils';

interface AddCompetitorForm {
  name: string;
  website: string;
  tag: Tag;
}

interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddCompetitorForm) => void;
}

export function AddCompetitorModal({ isOpen, onClose, onSubmit }: AddCompetitorModalProps) {
  const [form, setForm] = useState<AddCompetitorForm>({
    name: '',
    website: '',
    tag: 'core',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: '', website: '', tag: 'core' });
    onClose();
  };

  const tags: { value: Tag; label: string; description: string }[] = [
    { value: 'core', label: 'Core', description: 'Direct competitor' },
    { value: 'adjacent', label: 'Adjacent', description: 'Similar market' },
    { value: 'contrast', label: 'Contrast', description: 'Different approach' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Competitor"
      description="Add a new competitor to track and analyze."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Competitor Name
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., BlockFi"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Website URL
          </label>
          <Input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://example.com"
            type="url"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Competitor Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {tags.map(tag => (
              <button
                key={tag.value}
                type="button"
                onClick={() => setForm({ ...form, tag: tag.value })}
                className={cn(
                  'flex flex-col items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 border',
                  form.tag === tag.value
                    ? tag.value === 'core'
                      ? 'bg-tier-core text-white border-tier-core shadow-sm'
                      : tag.value === 'adjacent'
                      ? 'bg-tier-adjacent text-white border-tier-adjacent shadow-sm'
                      : 'bg-primary/10 text-primary border-primary'
                    : 'bg-bg-card text-text-secondary border-border hover:border-border-light hover:bg-bg-card-hover'
                )}
              >
                <span>{tag.label}</span>
                <span className={cn(
                  "text-[10px] mt-0.5",
                  form.tag === tag.value ? "opacity-80" : "text-text-muted"
                )}>
                  {tag.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Competitor
          </Button>
        </div>
      </form>
    </Modal>
  );
}
