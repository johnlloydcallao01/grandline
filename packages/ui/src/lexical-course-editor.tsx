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
  COMMAND_PRIORITY_EDITOR,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
  DecoratorNode,
  TextNode,
  type SerializedLexicalNode,
  type NodeKey,
  type EditorConfig,
} from 'lexical';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LinkNode } from '@lexical/link';
import { mergeRegister } from '@lexical/utils';

export type SharedMediaItem = {
  id: string;
  url: string;
  alt?: string;
  mimeType?: string;
};

type ImageNodeJSON = {
  type: 'course-image';
  version: 1;
  url: string;
  alt?: string;
  caption?: string;
  width?: string;
  height?: string;
} & SerializedLexicalNode;

class ImageNode extends DecoratorNode<React.ReactNode> {
  __url: string;
  __alt: string;
  __caption: string;
  __width: string;
  __height: string;

  static getType() {
    return 'course-image';
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__url, node.__alt, node.__caption, node.__width, node.__height, node.__key);
  }

  constructor(url: string, alt = '', caption = '', width?: string, height?: string, key?: NodeKey) {
    super(key);
    this.__url = url;
    this.__alt = alt;
    this.__caption = caption;
    this.__width = width || '';
    this.__height = height || '';
  }

  static importJSON(serializedNode: ImageNodeJSON) {
    const { url, alt, caption, width, height } = serializedNode;
    return new ImageNode(url, alt || '', caption || '', width, height);
  }

  exportJSON(): ImageNodeJSON {
    return {
      ...super.exportJSON(),
      type: 'course-image',
      version: 1,
      url: this.__url,
      alt: this.__alt || undefined,
      caption: this.__caption || undefined,
      width: this.__width || undefined,
      height: this.__height || undefined,
    };
  }

  createDOM(config: EditorConfig) {
    const figure = document.createElement('figure');
    const className = config.theme.image || '';
    if (className) {
      figure.className = className;
    }
    figure.style.display = 'flex';
    figure.style.flexDirection = 'column';
    figure.style.alignItems = 'flex-start';
    figure.style.margin = '12px 0';

    const img = document.createElement('img');
    img.src = this.__url;
    img.alt = this.__alt;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '4px';
    img.style.border = '1px solid #e5e7eb';
    if (this.__width) {
      img.style.width = this.__width;
    }
    if (this.__height) {
      img.style.height = this.__height;
    }

    figure.appendChild(img);

    if (this.__caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = this.__caption;
      caption.style.fontSize = '12px';
      caption.style.color = '#6b7280';
      caption.style.marginTop = '4px';
      figure.appendChild(caption);
    }

    return figure;
  }

  updateDOM(prevNode: ImageNode, dom: HTMLElement) {
    if (prevNode.__width === this.__width && prevNode.__height === this.__height) {
      return false;
    }
    const img = dom.querySelector('img') as globalThis.HTMLImageElement | null;
    if (img) {
      if (this.__width) {
        img.style.width = this.__width;
      } else {
        img.style.removeProperty('width');
      }
      if (this.__height) {
        img.style.height = this.__height;
      } else {
        img.style.removeProperty('height');
      }
    }
    return false;
  }

  decorate() {
    return null;
  }
}

function $createImageNode(config: { url: string; alt?: string }) {
  return new ImageNode(config.url, config.alt || '');
}

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
          children: 'Image',
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
                        items.map((item) =>
                          React.createElement(
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
                                      (selection as unknown as { anchor: { offset: number } }).anchor.offset ?? 0;
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
                                    const imageNode = $createImageNode({ url, alt });
                                    selection.insertNodes([imageNode]);
                                    if (commitRef) commitRef.current = true;
                                  }
                                });
                                setOpenLibrary(false);
                              },
                            },
                            React.createElement('img', {
                              src: item.url,
                              alt: item.alt || '',
                              style: {
                                width: '100%',
                                height: 100,
                                objectFit: 'cover',
                                borderRadius: 6,
                                background: '#f3f4f6',
                              },
                            }),
                          ),
                        ),
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
  const suppressCommitRef = useRef<boolean>(false);
  const commitGateRef = useRef<boolean>(false);

  const initialConfig = useMemo(
    () => ({
      namespace: 'course-description',
      editable: true,
      theme: {},
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, ImageNode, LinkNode],
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
          <TopToolbar commitRef={commitGateRef} />
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
          <TypingCommitPlugin commitRef={commitGateRef} />
          <CommitOnContentChangePlugin
            suppressRef={suppressCommitRef}
            commitRef={commitGateRef}
            onCommit={(json) => {
              if (onChange) {
                onChange(json);
              }
            }}
          />
          <SlashPopupPlugin loadMedia={loadMedia} commitRef={commitGateRef} />
        </LexicalComposer>
      </div>
    </div>
  );
}
