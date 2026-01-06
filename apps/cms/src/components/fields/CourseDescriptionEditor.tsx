'use client'

import React, { useMemo, useRef } from 'react'
import { useField } from '@payloadcms/ui'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
  DecoratorNode,
  type SerializedLexicalNode,
  type NodeKey,
  type EditorConfig,
} from 'lexical'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { LinkNode } from '@lexical/link'
import { mergeRegister } from '@lexical/utils'
import { createPortal } from 'react-dom'

const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#ffffff' }}>
      {children}
    </div>
  )
}

const Placeholder: React.FC = () => {
  return <div style={{ position: 'absolute', color: '#9ca3af', pointerEvents: 'none' }}>Type /image to insert an image</div>
}

type ImageNodeJSON = {
  type: 'course-image'
  version: 1
  url: string
  alt?: string
  caption?: string
  width?: string
  height?: string
} & SerializedLexicalNode

class ImageNode extends DecoratorNode<React.ReactNode> {
  __url: string
  __alt: string
  __caption: string
  __width: string
  __height: string

  static getType() {
    return 'course-image'
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__url, node.__alt, node.__caption, node.__width, node.__height, node.__key)
  }

  constructor(url: string, alt = '', caption = '', width?: string, height?: string, key?: NodeKey) {
    super(key)
    this.__url = url
    this.__alt = alt
    this.__caption = caption
    this.__width = width || ''
    this.__height = height || ''
  }

  static importJSON(serializedNode: ImageNodeJSON) {
    const { url, alt, caption, width, height } = serializedNode
    return new ImageNode(url, alt || '', caption || '', width, height)
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
    }
  }

  createDOM(config: EditorConfig) {
    const figure = document.createElement('figure')
    const className = config.theme.image || ''
    if (className) {
      figure.className = className
    }
    figure.style.display = 'flex'
    figure.style.flexDirection = 'column'
    figure.style.alignItems = 'flex-start'
    figure.style.margin = '12px 0'

    const img = document.createElement('img')
    img.src = this.__url
    img.alt = this.__alt
    img.style.maxWidth = '100%'
    img.style.borderRadius = '4px'
    img.style.border = '1px solid #e5e7eb'
    if (this.__width) {
      img.style.width = this.__width
    }
    if (this.__height) {
      img.style.height = this.__height
    }

    figure.appendChild(img)

    if (this.__caption) {
      const caption = document.createElement('figcaption')
      caption.textContent = this.__caption
      caption.style.fontSize = '12px'
      caption.style.color = '#6b7280'
      caption.style.marginTop = '4px'
      figure.appendChild(caption)
    }

    return figure
  }

  updateDOM(prevNode: ImageNode, dom: HTMLElement) {
    if (prevNode.__width === this.__width && prevNode.__height === this.__height) {
      return false
    }
    const img = dom.querySelector('img') as HTMLImageElement | null
    if (img) {
      if (this.__width) {
        img.style.width = this.__width
      } else {
        img.style.removeProperty('width')
      }
      if (this.__height) {
        img.style.height = this.__height
      } else {
        img.style.removeProperty('height')
      }
    }
    return false
  }

  decorate() {
    return null
  }
}

function $createImageNode(config: { url: string; alt?: string }) {
  return new ImageNode(config.url, config.alt || '')
}

const SlashPopupPlugin: React.FC<{ commitRef?: React.MutableRefObject<boolean> }> = ({ commitRef }) => {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = React.useState(false)
  const [openLibrary, setOpenLibrary] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  const libraryRef = React.useRef<HTMLDivElement | null>(null)
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event.key === '/') {
          setOpen(true)
        } else if (event.key === 'Escape') {
          if (openLibrary) {
            setOpenLibrary(false)
          } else {
            setOpen(false)
          }
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    )
    const onDown = (e: MouseEvent) => {
      if (openLibrary) {
        const node = libraryRef.current
        if (!node) return
        if (e.target instanceof Node && !node.contains(e.target)) setOpenLibrary(false)
      } else {
        const node = menuRef.current
        if (!node) return
        if (e.target instanceof Node && !node.contains(e.target)) setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => {
      unregister()
      document.removeEventListener('mousedown', onDown)
    }
  }, [editor, openLibrary])

  React.useEffect(() => {
    if (!openLibrary) return
    let active = true
    setLoading(true)
    setError(null)
      ; (async () => {
        try {
          const res = await fetch('/api/media?limit=60')
          const json = await res.json()
          const docs = Array.isArray(json?.docs) ? json.docs : []
          const images = docs.filter((d: any) => typeof d?.mimeType === 'string' ? d.mimeType.startsWith('image/') : true)
          if (active) setItems(images)
        } catch (_e: any) {
          if (active) setError('Failed to load media')
        } finally {
          if (active) setLoading(false)
        }
      })()
    return () => {
      active = false
    }
  }, [openLibrary])

  const slashMenu = open
    ? createPortal(
      React.createElement('div', {
        ref: menuRef as any,
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
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                const anchorNode: any = selection.anchor.getNode()
                const offset: number = (selection as any).anchor.offset ?? 0
                if (typeof anchorNode?.getTextContent === 'function') {
                  const text = anchorNode.getTextContent()
                  if (offset > 0 && text.charAt(offset - 1) === '/') {
                    if (typeof anchorNode.spliceText === 'function') {
                      anchorNode.spliceText(offset - 1, offset, '')
                    } else {
                      anchorNode.setTextContent(
                        text.slice(0, offset - 1) + text.slice(offset),
                      )
                    }
                  }
                }
              }
            })
            setOpen(false)
            setOpenLibrary(true)
          },
        }),
      }),
      document.body,
    )
    : null

  const libraryModal = openLibrary
    ? createPortal(
      React.createElement('div', {
        style: {
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 9998,
        },
        children: React.createElement('div', {
          ref: libraryRef as any,
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
                React.createElement('div', { key: 'title', style: { fontSize: 16, fontWeight: 600 }, children: 'Media Library' }),
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
                  ? React.createElement('div', { style: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }, children: 'Loading…' })
                  : error
                    ? React.createElement('div', { style: { color: '#ef4444', fontSize: 13 }, children: error })
                    : React.createElement(
                      'div',
                      {
                        style: {
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                          gap: 12,
                        },
                      },
                      items.map((item: any) =>
                        React.createElement(
                          'button',
                          {
                            key: item.id ?? item._id ?? item.filename ?? Math.random().toString(36),
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
                                const selection = $getSelection()
                                if ($isRangeSelection(selection)) {
                                  const anchorNode: any = selection.anchor.getNode()
                                  const offset: number = (selection as any).anchor.offset ?? 0
                                  if (typeof anchorNode?.getTextContent === 'function') {
                                    const text = anchorNode.getTextContent()
                                    if (offset > 0 && text.charAt(offset - 1) === '/') {
                                      if (typeof anchorNode.spliceText === 'function') {
                                        anchorNode.spliceText(offset - 1, offset, '')
                                      } else {
                                        anchorNode.setTextContent(text.slice(0, offset - 1) + text.slice(offset))
                                      }
                                    }
                                  }
                                  const url = item.cloudinaryURL ?? item.thumbnailURL ?? item.url ?? ''
                                  const alt = item.alt ?? ''
                                  const node = $createImageNode({ url, alt })
                                  selection.insertNodes([node])
                                  if (commitRef) commitRef.current = true
                                }
                              })
                              setOpenLibrary(false)
                            },
                          },
                          React.createElement('img', {
                            src: item.thumbnailURL ?? item.cloudinaryURL ?? item.url ?? '',
                            alt: item.alt ?? '',
                            style: { width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, background: '#f3f4f6' },
                          }),
                        ),
                      ),
                    ),
            }),
          ],
        }),
      }),
      document.body,
    )
    : null

  return (
    <>
      {slashMenu}
      {libraryModal}
    </>
  )
}

const ToolbarButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
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
  )
}

// Divider removed with toolbar simplification

const TopToolbar: React.FC<{ commitRef: React.MutableRefObject<boolean> }> = ({ commitRef }) => {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = React.useState(false)

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
    }
  }, [])

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        1,
      ),
    )
  }, [editor, updateToolbar])

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
          commitRef.current = true
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        }}
      >
        B
      </ToolbarButton>
    </div>
  )
}

const TypingCommitPlugin: React.FC<{ commitRef: React.MutableRefObject<boolean> }> = ({ commitRef }) => {
  const [editor] = useLexicalComposerContext()
  React.useEffect(() => {
    const unregisterKey = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        const key = event.key
        if (
          key === 'Enter' ||
          key === 'Backspace' ||
          key === 'Delete' ||
          (key.length === 1 && !event.ctrlKey && !event.metaKey)
        ) {
          commitRef.current = true
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    )
    return () => {
      unregisterKey()
    }
  }, [editor])
  return null
}

const CommitOnContentChangePlugin: React.FC<{
  onCommit: (json: any) => void
  suppressRef: React.MutableRefObject<boolean>
  commitRef: React.MutableRefObject<boolean>
}> = ({ onCommit, suppressRef, commitRef }) => {
  const [editor] = useLexicalComposerContext()
  const prevRef = React.useRef<string>('')

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const json = editorState.toJSON()
      const next = JSON.stringify(json)
      if (next !== prevRef.current) {
        if (!suppressRef.current && commitRef.current) {
          onCommit(json)
          commitRef.current = false
        }
        if (suppressRef.current) suppressRef.current = false
        prevRef.current = next
      } else {
        if (suppressRef.current) suppressRef.current = false
      }
    })
  }, [editor, onCommit])

  return null
}

export const CourseDescriptionEditor: React.FC = () => {
  const { value, setValue } = useField<any>({ path: 'description' })
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const initialConfig = useMemo(
    () => ({
      namespace: 'course-description',
      editable: true,
      theme: {},
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, ImageNode, LinkNode],
      editorState: (editor: any) => {
        if (value) {
          try {
            const state = editor.parseEditorState(value)
            editor.setEditorState(state)
          } catch (e) {
            console.error(e)
          }
        }
      },
      onError: (e: any) => {
        console.error(e)
      },
    }),
    [value],
  )

  const suppressCommitRef = useRef<boolean>(false)
  const commitGateRef = useRef<boolean>(false)

  return (
    <div>
      <FieldLabel htmlFor="description" label="Description" />
      <Container>
        {mounted ? (
          <LexicalComposer initialConfig={initialConfig}>
            <TopToolbar commitRef={commitGateRef} />
            <div style={{ position: 'relative' }}>
              <RichTextPlugin
                contentEditable={<ContentEditable id="description" style={{ minHeight: 160, outline: 'none' }} />}
                placeholder={<Placeholder />}
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
                try {
                  setValue(json)
                } catch (e) {
                  console.error(e)
                }
              }}
            />
            <SlashPopupPlugin commitRef={commitGateRef} />
          </LexicalComposer>
        ) : (
          <div style={{ minHeight: 160 }} />
        )}
      </Container>
    </div>
  )
}
