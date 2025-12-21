'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  LexicalEditor,
  TextNode,
} from 'lexical';
import { createPortal } from 'react-dom';
import { Plus, Type, Heading1, Heading2, Heading3, Quote, Code, List, ListOrdered, type LucideIcon } from '@/components/ui/IconWrapper';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $createListItemNode, $createListNode } from '@lexical/list';
import { $createCodeNode } from '@lexical/code';

interface BlockControlsProps {
  editor: LexicalEditor;
}

interface BlockType {
  key: string;
  name: string;
  icon: LucideIcon;
  description: string;
  onSelect: (editor: LexicalEditor) => void;
}

const BLOCK_TYPES: BlockType[] = [
  {
    key: 'paragraph',
    name: 'Paragraph',
    icon: Type,
    description: 'Start writing with plain text',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => {
            const node = selection.anchor.getNode();
            if (node instanceof TextNode) {
              node.setTextContent(node.getTextContent().replace(/^\/[a-zA-Z]*$/, ''));
            }
            return $createParagraphNode();
          });
        }
      });
    },
  },
  {
    key: 'heading1',
    name: 'Heading 1',
    icon: Heading1,
    description: 'Big section heading',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h1'));
        }
      });
    },
  },
  {
    key: 'heading2',
    name: 'Heading 2',
    icon: Heading2,
    description: 'Medium section heading',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h2'));
        }
      });
    },
  },
  {
    key: 'heading3',
    name: 'Heading 3',
    icon: Heading3,
    description: 'Small section heading',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h3'));
        }
      });
    },
  },
  {
    key: 'heading4',
    name: 'Heading 4',
    icon: Heading3,
    description: 'Subsection heading',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h4'));
        }
      });
    },
  },
  {
    key: 'heading5',
    name: 'Heading 5',
    icon: Heading3,
    description: 'Small subsection heading',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h5'));
        }
      });
    },
  },
  {
    key: 'heading6',
    name: 'Heading 6',
    icon: Heading3,
    description: 'Tiny subsection heading',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h6'));
        }
      });
    },
  },
  {
    key: 'quote',
    name: 'Quote',
    icon: Quote,
    description: 'Capture a quote',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    },
  },
  {
    key: 'bulleted-list',
    name: 'Bulleted List',
    icon: List,
    description: 'Create a simple bulleted list',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => {
            const listNode = $createListNode('bullet');
            const listItemNode = $createListItemNode();
            listNode.append(listItemNode);
            return listNode;
          });
        }
      });
    },
  },
  {
    key: 'numbered-list',
    name: 'Numbered List',
    icon: ListOrdered,
    description: 'Create a list with numbering',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => {
            const listNode = $createListNode('number');
            const listItemNode = $createListItemNode();
            listNode.append(listItemNode);
            return listNode;
          });
        }
      });
    },
  },
  {
    key: 'code',
    name: 'Code',
    icon: Code,
    description: 'Capture a code snippet',
    onSelect: (editor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode());
        }
      });
    },
  },
];

function BlockPickerMenu({
  editor,
  onClose,
  position,
}: {
  editor: LexicalEditor;
  onClose: () => void;
  position: { top: number; left: number };
}): React.JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleBlockSelect = useCallback((blockType: BlockType) => {
    blockType.onSelect(editor);
    onClose();
  }, [editor, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[280px] max-h-[400px] overflow-y-auto"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
        Add a block
      </div>
      {BLOCK_TYPES.map((blockType) => (
        <button
          key={blockType.key}
          className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors focus:bg-gray-50 focus:outline-none"
          onClick={() => handleBlockSelect(blockType)}
        >
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded mr-3">
            <blockType.icon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">{blockType.name}</div>
            <div className="text-xs text-gray-500 truncate">{blockType.description}</div>
          </div>
        </button>
      ))}
    </div>,
    document.body
  );
}

function BlockControls({ editor }: BlockControlsProps): React.JSX.Element {
  const [showButton, setShowButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [currentBlockElement, setCurrentBlockElement] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [blockPickerPosition, setBlockPickerPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updateButtonPosition = () => {
      const selection = $getSelection();
      const rootElement = editor.getRootElement();

      // Hide button if no selection, not a range selection, or no root element
      if (!$isRangeSelection(selection) || !selection.isCollapsed() || !rootElement) {
        setShowButton(false);
        setCurrentBlockElement(null);
        return;
      }

      const domSelection = window.getSelection();
      if (!domSelection || domSelection.rangeCount === 0) {
        setShowButton(false);
        setCurrentBlockElement(null);
        return;
      }

      const range = domSelection.getRangeAt(0);

      // Check if the selection is actually inside the editor
      if (!rootElement.contains(range.startContainer)) {
        setShowButton(false);
        setCurrentBlockElement(null);
        return;
      }

      // Find the actual block element (paragraph, heading, etc.)
      let blockElement = range.startContainer as Node;
      while (blockElement && blockElement.nodeType !== Node.ELEMENT_NODE) {
        blockElement = blockElement.parentNode!;
      }

      // Find the closest block-level element within the editor
      while (blockElement && blockElement !== rootElement) {
        const element = blockElement as HTMLElement;
        if (element.tagName && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI', 'DIV', 'PRE'].includes(element.tagName)) {
          // Ensure this element is actually inside the editor
          if (rootElement.contains(element)) {
            const rect = element.getBoundingClientRect();
            const rootRect = rootElement.getBoundingClientRect();

            setButtonPosition({
              top: rect.top - rootRect.top + 8,
              left: 10,
            });
            setCurrentBlockElement(element);
            setShowButton(true);
            return;
          }
        }
        blockElement = blockElement.parentNode!;
      }

      // If we get here, no valid block was found inside the editor
      setShowButton(false);
      setCurrentBlockElement(null);
    };

    const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateButtonPosition();
      });
    });

    // Listen for selection changes
    const handleSelectionChange = () => {
      setTimeout(() => {
        editor.getEditorState().read(() => {
          updateButtonPosition();
        });
      }, 0);
    };

    // Listen for clicks outside the editor to hide button
    const handleDocumentClick = (event: MouseEvent) => {
      const rootElement = editor.getRootElement();
      if (rootElement && !rootElement.contains(event.target as Node)) {
        setShowButton(false);
        setCurrentBlockElement(null);
        setShowBlockPicker(false);
      }
    };

    // Listen for focus events to ensure proper hiding
    const handleFocusOut = (event: FocusEvent) => {
      const rootElement = editor.getRootElement();
      if (rootElement && !rootElement.contains(event.relatedTarget as Node)) {
        setShowButton(false);
        setCurrentBlockElement(null);
        setShowBlockPicker(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      unregisterListener();
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [editor]);

  const handleButtonClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      let top = rect.bottom + 6;
      let left = rect.left;

      const menuWidth = 280;
      const menuHeight = 400;

      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
      }

      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 6;
      }

      if (top < 10) {
        top = rect.bottom + 6;
      }

      setBlockPickerPosition({ top, left });
      setShowBlockPicker(true);
    }
  }, []);

  return (
    <>
      {showButton && currentBlockElement && (
        <button
          ref={buttonRef}
          type="button"
          className="absolute z-40 w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
          style={{
            top: buttonPosition.top,
            left: buttonPosition.left,
          }}
          onClick={handleButtonClick}
          onMouseDown={(e) => e.preventDefault()}
          title="Add block"
          aria-label="Add block"
        >
          <Plus className="w-3.5 h-3.5 text-gray-600" />
        </button>
      )}
      {showBlockPicker && (
        <BlockPickerMenu
          editor={editor}
          onClose={() => setShowBlockPicker(false)}
          position={blockPickerPosition}
        />
      )}
    </>
  );
}

export default function BlockControlsPlugin(): React.JSX.Element {
  const [editor] = useLexicalComposerContext();

  return <BlockControls editor={editor} />;
}
