'use client';

import React, { useMemo, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $getRoot,
  COMMAND_PRIORITY_EDITOR,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
  DecoratorNode,
  TextNode,
  type SerializedLexicalNode,
  type NodeKey,
  type EditorConfig,
  type DOMExportOutput,
  type DOMConversionMap,
} from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LinkNode } from '@lexical/link';
import { mergeRegister } from '@lexical/utils';
import {
  ImageNode,
  IframeNode,
  $createImageNode,
  mapPayloadMediaDocsToSharedMediaItems,
  type SharedMediaItem,
} from './course-editor-nodes';

export { mapPayloadMediaDocsToSharedMediaItems, type SharedMediaItem };

const ToolbarButton: React.FC<React.ButtonHTMLAttributes<globalThis.HTMLButtonElement>> = (props) => {
  return (
    <button
      type="button"
      {...props}
      style={{
        height: 28,
        padding: '0 8px',
        borderRadius: 6,
        border: '1px solid #e5e7eb',
        background: '#f9fafb',
        cursor: 'pointer',
        fontSize: 13,
      }}
    />
  );
};

const TopToolbar: React.FC<{ commitRef: React.MutableRefObject<boolean> }> = ({ commitRef }) => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = React.useState(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
    }
  }, []);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar]);

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        background: '#f8fafc',
        padding: 8,
        marginBottom: 8,
      }}
    >
      <ToolbarButton
        aria-pressed={isBold}
        style={{ fontWeight: 700 }}
        onClick={() => {
          commitRef.current = true;
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
      >
        B
      </ToolbarButton>
    </div>
  );
};

const TypingCommitPlugin: React.FC<{ commitRef: React.MutableRefObject<boolean> }> = ({ commitRef }) => {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    const unregisterKey = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        const key = event.key;
        if (
          key === 'Enter' ||
          key === 'Backspace' ||
          key === 'Delete' ||
          (key.length === 1 && !event.ctrlKey && !event.metaKey)
        ) {
          commitRef.current = true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );
    return () => {
      unregisterKey();
    };
  }, [editor, commitRef]);
  return null;
};

const CommitOnContentChangePlugin: React.FC<{
  onCommit: (json: unknown) => void;
  suppressRef: React.MutableRefObject<boolean>;
  commitRef: React.MutableRefObject<boolean>;
}> = ({ onCommit, suppressRef, commitRef }) => {
  const [editor] = useLexicalComposerContext();
  const prevRef = React.useRef<string>('');

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const json = editorState.toJSON();
      const next = JSON.stringify(json);
      if (next !== prevRef.current) {
        if (!suppressRef.current && commitRef.current) {
          onCommit(json);
          commitRef.current = false;
        }
        if (suppressRef.current) suppressRef.current = false;
        prevRef.current = next;
      } else {
        if (suppressRef.current) suppressRef.current = false;
      }
    });
  }, [editor, onCommit, suppressRef, commitRef]);

  return null;
};

const SlashPopupPlugin: React.FC<{
  loadMedia: () => Promise<SharedMediaItem[]>;
  commitRef?: React.MutableRefObject<boolean>;
}> = ({ loadMedia, commitRef }) => {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = React.useState(false);
  const [openLibrary, setOpenLibrary] = React.useState(false);
  const menuRef = React.useRef<globalThis.HTMLDivElement | null>(null);
  const libraryRef = React.useRef<globalThis.HTMLDivElement | null>(null);
  const [items, setItems] = React.useState<SharedMediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event.key === '/') {
          setOpen(true);
        } else if (event.key === 'Escape') {
          if (openLibrary) {
            setOpenLibrary(false);
          } else {
            setOpen(false);
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );
    const onDown = (e: MouseEvent) => {
      if (openLibrary) {
        const node = libraryRef.current;
        if (!node) return;
        if (e.target instanceof globalThis.Node && !node.contains(e.target)) setOpenLibrary(false);
      } else {
        const node = menuRef.current;
        if (!node) return;
        if (e.target instanceof globalThis.Node && !node.contains(e.target)) setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => {
      unregister();
      document.removeEventListener('mousedown', onDown);
    };
  }, [editor, openLibrary]);

  React.useEffect(() => {
    if (!openLibrary) return;
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const media = await loadMedia();
        if (active) setItems(media);
      } catch {
        if (active) setError('Failed to load media');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [openLibrary, loadMedia]);

  const slashMenu = open
    ? React.createElement('div', {
      ref: menuRef,
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 260,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        background: '#ffffff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: 8,
        zIndex: 9999,
      },
      children: React.createElement('button', {
        type: 'button',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
          background: '#f9fafb',
          cursor: 'pointer',
          fontSize: 13,
        },
        children: 'Media Assets',
        onClick: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const node = selection.anchor.getNode();
              const offset: number =
                (selection as unknown as { anchor: { offset: number } }).anchor.offset ?? 0;
              if (node instanceof TextNode) {
                const text = node.getTextContent();
                if (offset > 0 && text.charAt(offset - 1) === '/') {
                  const before = text.slice(0, offset - 1);
                  const after = text.slice(offset);
                  node.setTextContent(before + after);
                }
              }
            }
          });
          setOpen(false);
          setOpenLibrary(true);
        },
      }),
    })
    : null;

  const libraryModal = openLibrary
    ? React.createElement('div', {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 9998,
      },
      children: React.createElement('div', {
        ref: libraryRef,
        style: {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          maxWidth: '95vw',
          height: 420,
          maxHeight: '80vh',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          background: '#ffffff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
        },
        children: [
          React.createElement('div', {
            key: 'header',
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
            },
            children: [
              React.createElement('div', {
                key: 'title',
                style: { fontSize: 16, fontWeight: 600 },
                children: 'Media Library',
              }),
              React.createElement('button', {
                key: 'close',
                type: 'button',
                style: {
                  height: 28,
                  padding: '0 10px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  fontSize: 13,
                },
                children: 'Close',
                onClick: () => setOpenLibrary(false),
              }),
            ],
          }),
          React.createElement('div', {
            key: 'body',
            style: {
              flex: 1,
              padding: 16,
              overflow: 'auto',
            },
            children:
              loading
                ? React.createElement('div', {
                  style: {
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                  },
                  children: 'Loading…',
                })
                : error
                  ? React.createElement('div', {
                    style: { color: '#ef4444', fontSize: 13 },
                    children: error,
                  })
                  : React.createElement(
                    'div',
                    {
                      style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 12,
                      },
                    },
                    items.map((item) => {
                      const isImage =
                        !item.mimeType || item.mimeType.startsWith('image/');

                      return React.createElement(
                        'button',
                        {
                          key: item.id,
                          type: 'button',
                          style: {
                            display: 'block',
                            width: '100%',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            background: '#ffffff',
                            padding: 6,
                            cursor: 'pointer',
                          },
                          onClick: () => {
                            editor.update(() => {
                              const selection = $getSelection();
                              if ($isRangeSelection(selection)) {
                                const node = selection.anchor.getNode();
                                const offset: number =
                                  (selection as unknown as { anchor: { offset: number } })
                                    .anchor.offset ?? 0;
                                if (node instanceof TextNode) {
                                  const text = node.getTextContent();
                                  if (offset > 0 && text.charAt(offset - 1) === '/') {
                                    const before = text.slice(0, offset - 1);
                                    const after = text.slice(offset);
                                    node.setTextContent(before + after);
                                  }
                                }
                                const url = item.url;
                                const alt = item.alt || '';
                                const mimeType = item.mimeType;
                                const imageNode = $createImageNode({ url, alt, mimeType });
                                selection.insertNodes([imageNode]);
                                if (commitRef) commitRef.current = true;
                              }
                            });
                            setOpenLibrary(false);
                          },
                        },
                        isImage
                          ? React.createElement('img', {
                            src: item.url,
                            alt: item.alt || '',
                            style: {
                              width: '100%',
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: 6,
                              background: '#f3f4f6',
                            },
                          })
                          : React.createElement(
                            'div',
                            {
                              style: {
                                width: '100%',
                                height: 100,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 6,
                                background: '#f3f4f6',
                                color: '#6b7280',
                                gap: 8,
                                padding: 4,
                              },
                            },
                            [
                              React.createElement('div', {
                                key: 'icon',
                                dangerouslySetInnerHTML: {
                                  __html:
                                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
                                },
                              }),
                              React.createElement(
                                'div',
                                {
                                  key: 'text',
                                  style: {
                                    fontSize: 10,
                                    textAlign: 'center',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    width: '100%',
                                  },
                                },
                                item.alt || 'File',
                              ),
                            ],
                          ),
                      );
                    }),
                  ),
          }),
        ],
      }),
    })
    : null;

  return (
    <>
      {slashMenu}
      {libraryModal}
    </>
  );
};

const EditorInner: React.FC<{
  loadMedia: () => Promise<SharedMediaItem[]>;
  commitRef: React.MutableRefObject<boolean>;
  suppressRef: React.MutableRefObject<boolean>;
  onCommit: (json: unknown) => void;
  placeholder: string;
}> = ({ loadMedia, commitRef, suppressRef, onCommit, placeholder }) => {
  const [editor] = useLexicalComposerContext();
  const [activeTab, setActiveTab] = React.useState<'visual' | 'html'>('visual');
  const [htmlContent, setHtmlContent] = React.useState('');

  const onTabChange = (tab: 'visual' | 'html') => {
    if (tab === activeTab) return;

    if (tab === 'html') {
      editor.update(() => {
        const html = $generateHtmlFromNodes(editor, null);
        setHtmlContent(html);
      });
      setActiveTab('html');
    } else {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(htmlContent, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
      setActiveTab('visual');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => onTabChange('visual')}
            style={{
              padding: '6px 12px',
              background: activeTab === 'visual' ? '#f3f4f6' : '#ffffff',
              fontWeight: activeTab === 'visual' ? 600 : 400,
              cursor: 'pointer',
              border: 'none',
              borderRight: '1px solid #e5e7eb',
              fontSize: 13,
            }}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => onTabChange('html')}
            style={{
              padding: '6px 12px',
              background: activeTab === 'html' ? '#f3f4f6' : '#ffffff',
              fontWeight: activeTab === 'html' ? 600 : 400,
              cursor: 'pointer',
              border: 'none',
              fontSize: 13,
            }}
          >
            HTML
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        <>
          <TopToolbar commitRef={commitRef} />
          <div style={{ position: 'relative' }}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  style={{ minHeight: 160, outline: 'none' }}
                />
              }
              placeholder={
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: '#9ca3af',
                    pointerEvents: 'none',
                  }}
                >
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <TypingCommitPlugin commitRef={commitRef} />
          <CommitOnContentChangePlugin
            suppressRef={suppressRef}
            commitRef={commitRef}
            onCommit={onCommit}
          />
          <SlashPopupPlugin loadMedia={loadMedia} commitRef={commitRef} />
        </>
      ) : (
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          style={{
            width: '100%',
            minHeight: 200,
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            padding: 12,
            outline: 'none',
            fontFamily: 'monospace',
            fontSize: 14,
            resize: 'vertical',
            lineHeight: 1.5,
          }}
        />
      )}
    </>
  );
};

export type LexicalCourseEditorProps = {
  value?: unknown;
  onChange?: (value: unknown) => void;
  placeholder?: string;
  className?: string;
  loadMedia: () => Promise<SharedMediaItem[]>;
};

export function LexicalCourseEditor({
  value,
  onChange,
  placeholder = 'Type /image to insert an image',
  className = '',
  loadMedia,
}: LexicalCourseEditorProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const suppressCommitRef = useRef<boolean>(false);
  const commitGateRef = useRef<boolean>(false);

  const initialConfig = useMemo(
    () => ({
      namespace: 'course-description',
      editable: true,
      theme: {},
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, ImageNode, LinkNode, IframeNode],
      editorState: (editor: unknown) => {
        if (value) {
          try {
            const lexicalEditor = editor as {
              parseEditorState: (s: string) => unknown;
              setEditorState: (s: unknown) => void;
            };
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            const state = lexicalEditor.parseEditorState(serialized);
            lexicalEditor.setEditorState(state);
          } catch (e) {
            console.error(e);
          }
        }
      },
      onError: (e: unknown) => {
        console.error(e);
      },
    }),
    [value],
  );

  if (!isMounted) {
    return (
      <div className={className}>
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 12,
            background: '#ffffff',
            minHeight: '150px',
          }}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 12,
          background: '#ffffff',
        }}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <EditorInner
            loadMedia={loadMedia}
            commitRef={commitGateRef}
            suppressRef={suppressCommitRef}
            onCommit={(json) => {
              if (onChange) {
                onChange(json);
              }
            }}
            placeholder={placeholder}
          />
        </LexicalComposer>
      </div>
    </div>
  );
}
