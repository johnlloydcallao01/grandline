import React, { useEffect, useRef, useState } from 'react';
import { SharedMediaItem } from './course-editor-nodes';

function useSystemTheme() {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(media.matches);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (e: any) => setIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);
  return isDark;
}

export interface MediaLibraryModalProps {
  /**
   * Whether the modal is currently visible
   */
  isOpen: boolean;
  /**
   * Function to close the modal
   */
  onClose: () => void;
  /**
   * Callback when a media item is selected
   */
  onSelect: (item: SharedMediaItem) => void;
  /**
   * Async function to load media items
   */
  loadMedia: () => Promise<SharedMediaItem[]>;
  /**
   * Optional custom title for the modal
   */
  title?: string;
  /**
   * Optional z-index override (default: 9998)
   */
  zIndex?: number;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  loadMedia,
  title = 'Media Library',
  zIndex = 9998,
}) => {
  const libraryRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<SharedMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDark = useSystemTheme();

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const media = await loadMedia();
        if (active) setItems(media);
      } catch (err) {
        if (active) setError('Failed to load media');
        console.error('Error loading media:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isOpen, loadMedia]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (libraryRef.current && !libraryRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: zIndex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        ref={libraryRef}
        style={{
          width: 800,
          maxWidth: '95vw',
          height: 420,
          maxHeight: '80vh',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          background: isDark ? '#111827' : '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div
          key="header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
            background: isDark ? '#1f2937' : '#f9fafb',
          }}
        >
          <div
            key="title"
            style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f9fafb' : '#111827' }}
          >
            {title}
          </div>
          <button
            key="close"
            type="button"
            style={{
                height: 28,
                padding: '0 10px',
                borderRadius: 6,
                border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
                background: isDark ? '#374151' : '#f9fafb',
                cursor: 'pointer',
                fontSize: 13,
                color: isDark ? '#f9fafb' : '#374151',
              }}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div
          key="body"
          style={{
            flex: 1,
            padding: 16,
            overflow: 'auto',
          }}
        >
          {loading ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#d1d5db' : '#6b7280',
              }}
            >
              Loading…
            </div>
          ) : error ? (
            <div
              style={{ color: '#ef4444', fontSize: 13 }}
            >
              {error}
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#d1d5db' : '#6b7280',
                fontSize: 13,
              }}
            >
              No media items found.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 12,
              }}
            >
              {items.map((item) => {
                const isImage = !item.mimeType || item.mimeType.startsWith('image/');

                return (
                  <button
                    key={item.id}
                    type="button"
                    style={{
                      display: 'block',
                      width: '100%',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: isDark ? '#1f2937' : '#ffffff',
                      padding: 6,
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => onSelect(item)}
                  >
                    {isImage ? (
                      <img
                        src={item.url}
                        alt={item.alt || ''}
                        style={{
                          width: '100%',
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 6,
                          background: isDark ? '#374151' : '#f3f4f6',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isDark ? '#374151' : '#f3f4f6',
                          borderRadius: 6,
                          color: isDark ? '#d1d5db' : '#6b7280',
                          fontSize: 12,
                          textAlign: 'center',
                          padding: 4,
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.alt || 'File'}
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: isDark ? '#f3f4f6' : '#374151',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left',
                      }}
                    >
                      {item.alt || 'Untitled'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
