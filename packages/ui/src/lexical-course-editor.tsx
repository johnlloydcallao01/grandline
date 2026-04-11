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
  $isElementNode,
  $isDecoratorNode,
  $createParagraphNode,
  COMMAND_PRIORITY_EDITOR,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
  PASTE_COMMAND,
  DROP_COMMAND,
  CUT_COMMAND,
  TextNode,
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
import { MediaLibraryModal } from './media-library-modal';

export { mapPayloadMediaDocsToSharedMediaItems, type SharedMediaItem };

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

const ToolbarButton: React.FC<React.ButtonHTMLAttributes<globalThis.HTMLButtonElement>> = (props) => {
  const isDark = useSystemTheme();
  return (
    <button
      type="button"
      {...props}
      style={{
        height: 28,
        padding: '0 8px',
        borderRadius: 6,
        border: '1px solid #e5e7eb',
        background: isDark ? '#1f2937' : '#f9fafb',
        color: isDark ? '#f9fafb' : 'inherit',
        cursor: 'pointer',
        fontSize: 13,
      }}
    />
  );
};

const TopToolbar: React.FC<{ commitRef: React.MutableRefObject<boolean> }> = ({ commitRef }) => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = React.useState(false);
  const isDark = useSystemTheme();

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
        background: isDark ? '#111827' : '#f8fafc',
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

    const unregisterPaste = editor.registerCommand(
      PASTE_COMMAND,
      () => {
        commitRef.current = true;
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const unregisterDrop = editor.registerCommand(
      DROP_COMMAND,
      () => {
        commitRef.current = true;
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const unregisterCut = editor.registerCommand(
      CUT_COMMAND,
      () => {
        commitRef.current = true;
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return () => {
      unregisterKey();
      unregisterPaste();
      unregisterDrop();
      unregisterCut();
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
  uploadMedia?: (file: File) => Promise<SharedMediaItem>;
  commitRef?: React.MutableRefObject<boolean>;
}> = ({ loadMedia, uploadMedia, commitRef }) => {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = React.useState(false);
  const [openLibrary, setOpenLibrary] = React.useState(false);
  const menuRef = React.useRef<globalThis.HTMLDivElement | null>(null);
  const isDark = useSystemTheme();

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
      if (openLibrary) return;

      const node = menuRef.current;
      if (!node) return;
      if (e.target instanceof globalThis.Node && !node.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => {
      unregister();
      document.removeEventListener('mousedown', onDown);
    };
  }, [editor, openLibrary]);

  const onSelectMedia = (item: SharedMediaItem) => {
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
        const mimeType = item.mimeType;
        const imageNode = $createImageNode({ url, alt, mimeType });
        selection.insertNodes([imageNode]);
        if (commitRef) commitRef.current = true;
      }
    });
    setOpenLibrary(false);
  };

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
        background: isDark ? '#111827' : '#ffffff',
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
          background: isDark ? '#1f2937' : '#f9fafb',
          color: isDark ? '#f9fafb' : 'inherit',
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

  return (
    <>
      {slashMenu}
      <MediaLibraryModal
        isOpen={openLibrary}
        onClose={() => setOpenLibrary(false)}
        onSelect={onSelectMedia}
        loadMedia={loadMedia}
        uploadMedia={uploadMedia}
      />
    </>
  );
};

const EditorInner: React.FC<{
  loadMedia: () => Promise<SharedMediaItem[]>;
  uploadMedia?: (file: File) => Promise<SharedMediaItem>;
  commitRef: React.MutableRefObject<boolean>;
  suppressRef: React.MutableRefObject<boolean>;
  onCommit: (json: unknown) => void;
  placeholder: string;
}> = ({ loadMedia, uploadMedia, commitRef, suppressRef, onCommit, placeholder }) => {
  const [editor] = useLexicalComposerContext();
  const [activeTab, setActiveTab] = React.useState<'visual' | 'html'>('visual');
  const [htmlContent, setHtmlContent] = React.useState('');
  const isDark = useSystemTheme();

  const onTabChange = (tab: 'visual' | 'html') => {
    if (tab === activeTab) return;

    if (tab === 'html') {
      editor.update(() => {
        const html = $generateHtmlFromNodes(editor, null);
        setHtmlContent(html);
      });
      setActiveTab('html');
    } else {
      commitRef.current = true;
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(htmlContent, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        
        let currentParagraph: any = null;
        for (const node of nodes) {
          if (($isElementNode(node) && !node.isInline()) || ($isDecoratorNode(node) && !(node as any).isInline())) {
            root.append(node);
            currentParagraph = null;
          } else {
            if (!currentParagraph) {
              currentParagraph = $createParagraphNode();
              root.append(currentParagraph);
            }
            currentParagraph.append(node);
          }
        }
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
              background: activeTab === 'visual' ? (isDark ? '#374151' : '#f3f4f6') : (isDark ? '#111827' : '#ffffff'),
              fontWeight: activeTab === 'visual' ? 600 : 400,
              color: isDark ? '#f9fafb' : 'inherit',
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
              background: activeTab === 'html' ? (isDark ? '#374151' : '#f3f4f6') : (isDark ? '#111827' : '#ffffff'),
              fontWeight: activeTab === 'html' ? 600 : 400,
              color: isDark ? '#f9fafb' : 'inherit',
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
          <SlashPopupPlugin loadMedia={loadMedia} uploadMedia={uploadMedia} commitRef={commitRef} />
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
            background: isDark ? '#111827' : 'transparent',
            color: isDark ? '#f9fafb' : 'inherit',
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
  uploadMedia?: (file: File) => Promise<SharedMediaItem>;
};

export function LexicalCourseEditor({
  value,
  onChange,
  placeholder = 'Type /image to insert an image',
  className = '',
  loadMedia,
  uploadMedia,
}: LexicalCourseEditorProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const isDark = useSystemTheme();

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
            background: isDark ? '#111827' : '#ffffff',
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
          background: isDark ? '#111827' : '#ffffff',
        }}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <EditorInner
            loadMedia={loadMedia}
            uploadMedia={uploadMedia}
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
