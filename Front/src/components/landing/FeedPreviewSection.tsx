'use client';

import { useState } from 'react';
import { FeedCard, FeedBlurModal } from './LandingComponents';

/**
 * Feed preview bento-grid with interactive modal.
 * Extracted as a client component so the parent landing page
 * can remain a Server Component (no JS shipped for static sections).
 */
export default function FeedPreviewSection() {
  const [showFeedModal, setShowFeedModal] = useState(false);

  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Col 1 */}
        <div className="space-y-3 md:space-y-4">
          <FeedCard aspectClass="aspect-[3/4]" onInteract={() => setShowFeedModal(true)} />
          <FeedCard aspectClass="aspect-square" onInteract={() => setShowFeedModal(true)} />
        </div>
        {/* Col 2 — tall */}
        <div className="space-y-3 md:space-y-4">
          <FeedCard aspectClass="aspect-[2/3]" onInteract={() => setShowFeedModal(true)} />
          <FeedCard aspectClass="aspect-[3/4]" onInteract={() => setShowFeedModal(true)} />
        </div>
        {/* Col 3 (hidden on mobile) */}
        <div className="hidden md:flex flex-col gap-4">
          <FeedCard aspectClass="aspect-square" onInteract={() => setShowFeedModal(true)} />
          <FeedCard aspectClass="aspect-[3/5]" onInteract={() => setShowFeedModal(true)} />
        </div>
        {/* Col 4 (hidden on mobile) */}
        <div className="hidden md:flex flex-col gap-4">
          <FeedCard aspectClass="aspect-[3/4]" onInteract={() => setShowFeedModal(true)} />
          <FeedCard aspectClass="aspect-square" onInteract={() => setShowFeedModal(true)} />
        </div>
      </div>

      {/* Fade out bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0D0A08] to-transparent pointer-events-none" />

      {/* Blur modal */}
      {showFeedModal && (
        <FeedBlurModal onClose={() => setShowFeedModal(false)} />
      )}
    </div>
  );
}
