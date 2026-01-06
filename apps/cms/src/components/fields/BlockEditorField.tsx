'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import type { ContentBlock } from '@encreasl/cms-types'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TRANSFORMERS } from '@lexical/markdown'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getNodeByKey,
  EditorState,
  DecoratorNode,
  type EditorConfig,
  type NodeKey,
  type SerializedLexicalNode,
} from 'lexical'
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode, $createListItemNode, $createListNode } from '@lexical/list'
import { CodeNode, $createCodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'

type ImageNodeJSON = {
  type: 'image'
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
    return 'image'
  }

  static clone(node: ImageNode) {
    return new ImageNode(
      node.__url,
      node.__alt,
      node.__caption,
      node.__width,
      node.__height,
      node.__key,
    )
  }

  constructor(
    url: string,
    alt = '',
    caption = '',
    width?: string,
    height?: string,
    key?: NodeKey,
  ) {
    super(key)
    this.__url = url
    this.__alt = alt
    this.__caption = caption
    this.__width = width || ''
    this.__height = height || ''
  }

  static importJSON(serializedNode: ImageNodeJSON) {
    const { url, alt, caption, width, height } = serializedNode
    const node = new ImageNode(url, alt || '', caption || '', width, height)
    return node
  }

  exportJSON(): ImageNodeJSON {
    return {
      ...super.exportJSON(),
      type: 'image',
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
    const key = this.getKey()
    figure.dataset.imageNodeKey = key
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

  getUrl() {
    return this.__url
  }

  getAlt() {
    return this.__alt
  }

  getCaption() {
    return this.__caption
  }

  getWidth() {
    return this.__width
  }

  getHeight() {
    return this.__height
  }

  setWidth(width: string) {
    const writable = this.getWritable() as ImageNode
    writable.__width = width
  }

  setHeight(height: string) {
    const writable = this.getWritable() as ImageNode
    writable.__height = height
  }
}

function $createImageNode(config: {
  url: string
  alt?: string
  caption?: string
  width?: string
  height?: string
}) {
  return new ImageNode(config.url, config.alt || '', config.caption || '', config.width, config.height)
}

type FieldProps = {
  path: string
  label?: string
  required?: boolean
  description?: string
}

function mapBlocksToEditor(blocks: ContentBlock[]) {
  const normalized = Array.isArray(blocks) ? blocks : []
  return normalized
}

function InitialBlocksPlugin({ blocks }: { blocks: ContentBlock[] }) {
  const [editor] = useLexicalComposerContext()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) {
      return
    }
    initializedRef.current = true

    editor.update(() => {
      const root = $getRoot()
      root.clear()

      const effectiveBlocks = mapBlocksToEditor(blocks)

      if (!effectiveBlocks.length) {
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode(''))
        root.append(paragraph)
        return
      }

      effectiveBlocks.forEach((block) => {
        if (block.type === 'heading') {
          const level = block.level
          const tag = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4'
          const heading = $createHeadingNode(tag)
          heading.append($createTextNode(block.text))
          root.append(heading)
          return
        }

        if (block.type === 'paragraph') {
          const paragraph = $createParagraphNode()
          paragraph.append($createTextNode(block.text))
          root.append(paragraph)
          return
        }

        if (block.type === 'list') {
          const listType = block.style === 'ordered' ? 'number' : 'bullet'
          const list = $createListNode(listType)
          block.items.forEach((item) => {
            const listItem = $createListItemNode()
            listItem.append($createTextNode(item))
            list.append(listItem)
          })
          root.append(list)
          return
        }

        if (block.type === 'quote') {
          const quote = $createQuoteNode()
          quote.append($createTextNode(block.text))
          root.append(quote)
          return
        }

        if (block.type === 'code') {
          const code = $createCodeNode(block.language || '')
          code.append($createTextNode(block.code))
          root.append(code)
          return
        }

        if (block.type === 'image') {
          const imageNode = $createImageNode({
            url: block.url,
            alt: block.alt,
            caption: block.caption,
            width: block.width,
            height: block.height,
          })
          root.append(imageNode)
        }
      })
    })
  }, [editor, blocks])

  return null
}

function BlocksOnChangePlugin({ onChange }: { onChange: (blocks: ContentBlock[]) => void }) {
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot()
      const children = root.getChildren()
      const blocks: ContentBlock[] = []

      children.forEach((node) => {
        const type = node.getType()
        if (type === 'paragraph') {
          const text = node.getTextContent().trim()
          if (text.length > 0) {
            blocks.push({ type: 'paragraph', text })
          }
          return
        }

        if (type === 'heading') {
          const text = node.getTextContent().trim()
          if (!text.length) {
            return
          }
          const headingNode = node as HeadingNode
          const tag = headingNode.getTag()
          let level: 1 | 2 | 3 | 4 = 1
          if (tag === 'h2') level = 2
          else if (tag === 'h3') level = 3
          else if (tag === 'h4') level = 4
          blocks.push({
            type: 'heading',
            level,
            text,
          })
          return
        }

        if (type === 'quote') {
          const quoteNode = node as QuoteNode
          const text = quoteNode.getTextContent().trim()
          if (text.length > 0) {
            blocks.push({
              type: 'quote',
              text,
            })
          }
          return
        }

        if (type === 'code') {
          const codeNode = node as CodeNode
          const code = codeNode.getTextContent()
          blocks.push({
            type: 'code',
            code,
          })
          return
        }

        if (type === 'list') {
          const listNode = node as ListNode
          const listType = listNode.getListType()
          const style = listType === 'number' ? 'ordered' : 'unordered'
          const items: string[] = []
          listNode.getChildren().forEach((child) => {
            const itemNode = child as ListItemNode
            const text = itemNode.getTextContent().trim()
            if (text.length > 0) {
              items.push(text)
            }
          })
          if (items.length > 0) {
            blocks.push({
              type: 'list',
              style,
              items,
            })
          }
          return
        }

        if (type === 'image') {
          const imageNode = node as unknown as ImageNode
          const url = imageNode.getUrl()
          if (!url) {
            return
          }
          blocks.push({
            type: 'image',
            url,
            alt: imageNode.getAlt() || undefined,
            caption: imageNode.getCaption() || undefined,
            width: imageNode.getWidth() || undefined,
            height: imageNode.getHeight() || undefined,
          })
        }
      })

      onChange(blocks)
    })
  }

  return <OnChangePlugin onChange={handleChange} />
}

function ImageControlsPlugin() {
  const [editor] = useLexicalComposerContext()
  const [state, setState] = useState<{
    nodeKey: NodeKey | null
    rect: DOMRect | null
    width: string
    height: string
  }>({
    nodeKey: null,
    rect: null,
    width: '',
    height: '',
  })

  useEffect(() => {
    const root = editor.getRootElement()
    if (!root) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target || !root.contains(target)) {
        setState({
          nodeKey: null,
          rect: null,
          width: '',
          height: '',
        })
        return
      }

      const figure = target.closest('figure[data-image-node-key]') as HTMLElement | null
      if (!figure) {
        setState({
          nodeKey: null,
          rect: null,
          width: '',
          height: '',
        })
        return
      }

      const key = figure.dataset.imageNodeKey as NodeKey | undefined
      if (!key) {
        return
      }

      editor.update(() => {
        const node = $getNodeByKey<ImageNode>(key)
        if (!(node instanceof ImageNode)) {
          return
        }
        const dom = editor.getElementByKey(key)
        if (!dom) {
          return
        }
        const rect = dom.getBoundingClientRect()
        setState({
          nodeKey: key,
          rect,
          width: node.getWidth() || '',
          height: node.getHeight() || '',
        })
      })
    }

    root.addEventListener('click', handleClick)

    return () => {
      root.removeEventListener('click', handleClick)
    }
  }, [editor])

  const hasSelection = state.nodeKey !== null && state.rect !== null

  const handleWidthChange = (value: string) => {
    const key = state.nodeKey
    if (!key) {
      setState((prev) => ({
        ...prev,
        width: value,
      }))
      return
    }
    editor.update(() => {
      const node = $getNodeByKey<ImageNode>(key)
      if (node instanceof ImageNode) {
        node.setWidth(value.trim())
      }
    })
    const dom = editor.getElementByKey(key)
    if (dom) {
      const rect = dom.getBoundingClientRect()
      setState((prev) => ({
        ...prev,
        rect,
        width: value,
      }))
    } else {
      setState((prev) => ({
        ...prev,
        width: value,
      }))
    }
  }

  const handleHeightChange = (value: string) => {
    const key = state.nodeKey
    if (!key) {
      setState((prev) => ({
        ...prev,
        height: value,
      }))
      return
    }
    editor.update(() => {
      const node = $getNodeByKey<ImageNode>(key)
      if (node instanceof ImageNode) {
        node.setHeight(value.trim())
      }
    })
    setState((prev) => ({
      ...prev,
      height: value,
    }))
  }

  const handleResizeMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const key = state.nodeKey
    const rect = state.rect
    if (!key || !rect) {
      return
    }

    const startX = event.clientX
    const startWidth = rect.width
    const minWidth = 40

    const handleMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const nextWidth = Math.max(minWidth, startWidth + dx)
      editor.update(() => {
        const node = $getNodeByKey<ImageNode>(key)
        if (node instanceof ImageNode) {
          node.setWidth(`${Math.round(nextWidth)}px`)
        }
      })
      const dom = editor.getElementByKey(key)
      if (dom) {
        const nextRect = dom.getBoundingClientRect()
        setState((prev) => ({
          ...prev,
          rect: nextRect,
          width: `${Math.round(nextWidth)}px`,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          width: `${Math.round(nextWidth)}px`,
        }))
      }
    }

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  if (!hasSelection) {
    return null
  }

  const rect = state.rect
  const handleStyle: React.CSSProperties | undefined = rect
    ? {
      position: 'fixed',
      left: rect.right - 8,
      top: rect.bottom - 8,
      width: 12,
      height: 12,
      backgroundColor: '#2563eb',
      borderRadius: 9999,
      cursor: 'nwse-resize',
      zIndex: 50,
    }
    : undefined

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-700">
        <span className="font-medium text-gray-600">Image size</span>
        <label className="flex items-center gap-1">
          <span>W</span>
          <input
            type="text"
            value={state.width}
            onChange={(event) => handleWidthChange(event.target.value)}
            placeholder="100% or 300px"
            className="w-28 rounded border border-gray-300 px-1 py-0.5 text-xs"
          />
        </label>
        <label className="flex items-center gap-1">
          <span>H</span>
          <input
            type="text"
            value={state.height}
            onChange={(event) => handleHeightChange(event.target.value)}
            placeholder="auto or 300px"
            className="w-28 rounded border border-gray-300 px-1 py-0.5 text-xs"
          />
        </label>
      </div>
      {handleStyle && (
        <div
          style={handleStyle}
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </>
  )
}

function ContentBlocksEditor({
  value,
  onChange,
}: {
  value: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
}) {
  const editorConfig = useMemo(
    () => ({
      namespace: 'ContentBlocksEditor',
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        ImageNode,
        AutoLinkNode,
        LinkNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        HorizontalRuleNode,
      ],
      onError(error: Error) {
        console.error(error)
      },
      theme: {
        paragraph: 'payload-editor-paragraph',
      },
    }),
    [],
  )

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      <LexicalComposer initialConfig={editorConfig}>
        <div className="p-3">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[160px] outline-none text-sm leading-relaxed" />
            }
            placeholder={
              <div className="text-xs text-gray-400">
                Start writing content blocks. Use headings, paragraphs, lists, quotes, and code.
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <BlocksOnChangePlugin onChange={onChange} />
          <InitialBlocksPlugin blocks={value} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <ImageControlsPlugin />
        </div>
      </LexicalComposer>
    </div>
  )
}

export function BlockEditorField(props: FieldProps) {
  const { value, setValue } = useField<ContentBlock[]>({
    path: props.path,
  })

  const blocks = useMemo<ContentBlock[]>(() => {
    if (!value) {
      return []
    }
    if (Array.isArray(value)) {
      return value as ContentBlock[]
    }
    return []
  }, [value])

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel label={props.label} required={props.required} htmlFor={props.path} />
      <ContentBlocksEditor
        value={blocks}
        onChange={(next) => {
          setValue(next)
        }}
      />
      {props.description && (
        <p className="text-xs text-gray-500">
          {props.description}
        </p>
      )}
    </div>
  )
}
