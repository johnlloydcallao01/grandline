import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type {
  ContentBlock,
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  ImageBlock,
  QuoteBlock,
  CodeBlock,
} from '@/types/course'

function renderHeadingBlock(block: HeadingBlock, index: number) {
  const baseClass = 'font-semibold text-gray-900'
  const spacingClass = index === 0 ? 'mt-0 mb-3' : 'mt-6 mb-3'

  if (block.level === 1) {
    return (
      <h3 key={index} className={`text-2xl ${baseClass} ${spacingClass}`}>
        {block.text}
      </h3>
    )
  }

  if (block.level === 2) {
    return (
      <h4 key={index} className={`text-xl ${baseClass} ${spacingClass}`}>
        {block.text}
      </h4>
    )
  }

  return (
    <h5 key={index} className={`text-lg ${baseClass} ${spacingClass}`}>
      {block.text}
    </h5>
  )
}

function renderParagraphBlock(block: ParagraphBlock, index: number) {
  return (
    <p key={index} className="text-gray-700 leading-relaxed mb-4">
      {block.text}
    </p>
  )
}

function renderListBlock(block: ListBlock, index: number) {
  const ListTag = block.style === 'ordered' ? 'ol' : 'ul'
  return (
    <ListTag
      key={index}
      className={`pl-5 space-y-1 text-gray-700 leading-relaxed mb-4 ${block.style === 'ordered' ? 'list-decimal' : 'list-disc'}`}
    >
      {block.items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ListTag>
  )
}

function renderImageBlock(block: ImageBlock, index: number) {
  if (!block.url) return null

  const style: React.CSSProperties = {
    width: block.width || '100%',
    height: block.height || 'auto',
    maxWidth: '100%',
  }

  return (
    <figure key={index} className="w-full mb-6">
      {/* @ts-ignore */}
      <Image
        src={block.url}
        alt={block.alt || ''}
        width={800}
        height={450}
        style={style}
        className="rounded-lg border border-gray-200 object-cover"
      />
      {block.caption && (
        <figcaption className="mt-2 text-sm text-gray-500">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

function renderQuoteBlock(block: QuoteBlock, index: number) {
  return (
    <blockquote
      key={index}
      className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-6"
    >
      <p>{block.text}</p>
      {block.attribution && (
        <footer className="mt-1 text-sm text-gray-500">
          — {block.attribution}
        </footer>
      )}
    </blockquote>
  )
}

function renderCodeBlock(block: CodeBlock, index: number) {
  return (
    <pre
      key={index}
      className="bg-gray-900 text-gray-100 text-sm rounded-md p-4 overflow-x-auto mb-6"
    >
      <code>{block.code}</code>
    </pre>
  )
}

function renderLexicalTextNode(node: any, key: string): React.ReactNode {
  const raw = typeof node.text === 'string' ? node.text : ''
  let content: React.ReactNode = raw

  const format = typeof node.format === 'number' ? node.format : 0

  if (!raw) {
    return null
  }

  if (format & 16) {
    content = <code key={`${key}-code`} className="bg-gray-100 px-1 rounded text-sm font-mono text-pink-600">{content}</code>
  }
  if (format & 1) {
    content = <strong key={`${key}-bold`}>{content}</strong>
  }
  if (format & 2) {
    content = <em key={`${key}-italic`}>{content}</em>
  }
  if (format & 4) {
    content = <u key={`${key}-underline`}>{content}</u>
  }
  if (format & 8) {
    content = <s key={`${key}-strikethrough`}>{content}</s>
  }
  if (format & 32) {
    content = <sub key={`${key}-sub`}>{content}</sub>
  }
  if (format & 64) {
    content = <sup key={`${key}-sup`}>{content}</sup>
  }

  return content
}

function renderLexicalChildren(node: any, keyPrefix: string): React.ReactNode[] {
  const children = Array.isArray(node?.children) ? node.children : []
  return children
    .map((child, index) => renderLexicalNode(child, `${keyPrefix}-${index}`))
    .filter(Boolean) as React.ReactNode[]
}

function renderLexicalNode(node: any, key: string): React.ReactNode {
  if (!node || typeof node !== 'object') {
    return null
  }

  const type = node.type

  if (type === 'text') {
    return renderLexicalTextNode(node, key)
  }

  if (type === 'paragraph') {
    const children = Array.isArray((node as any).children)
      ? (node as any).children
      : []

    const hasBlockChild = children.some((child: any) => {
      if (!child || typeof child !== 'object') return false
      const childType = child.type
      if (childType === 'image' || childType === 'course-image') return true
      if (childType === 'list' || childType === 'quote' || childType === 'code') return true
      if (childType === 'upload' && child.relationTo === 'media') return true
      return false
    })

    if (!hasBlockChild) {
      return (
        <p key={key} className="text-gray-700 leading-relaxed mb-4">
          {renderLexicalChildren(node, key)}
        </p>
      )
    }

    return (
      <div key={key} className="space-y-4 mb-4">
        {children.map((child: any, index: number) => {
          if (!child || typeof child !== 'object') return null

          if (child.type === 'text') {
            return (
              <p
                key={`${key}-p-${index}`}
                className="text-gray-700 leading-relaxed"
              >
                {renderLexicalTextNode(child, `${key}-text-${index}`)}
              </p>
            )
          }

          return renderLexicalNode(child, `${key}-${index}`)
        })}
      </div>
    )
  }

  if (type === 'heading') {
    const tag = node.tag
    const baseClass = 'font-semibold text-gray-900'
    const spacingClass = 'mt-8 mb-4'

    if (tag === 'h1') {
      return (
        <h3 key={key} className={`text-2xl ${baseClass} ${spacingClass}`}>
          {renderLexicalChildren(node, key)}
        </h3>
      )
    }

    if (tag === 'h2') {
      return (
        <h4 key={key} className={`text-xl ${baseClass} ${spacingClass}`}>
          {renderLexicalChildren(node, key)}
        </h4>
      )
    }

    return (
      <h5 key={key} className={`text-lg ${baseClass} ${spacingClass}`}>
        {renderLexicalChildren(node, key)}
      </h5>
    )
  }

  if (type === 'quote') {
    return (
      <blockquote
        key={key}
        className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-6"
      >
        {renderLexicalChildren(node, key)}
      </blockquote>
    )
  }

  if (type === 'list') {
    const listType = node.listType === 'number' ? 'ol' : 'ul'
    const ListTag = listType === 'ol' ? 'ol' : 'ul'
    return (
      <ListTag
        key={key}
        className={`pl-5 space-y-2 text-gray-700 leading-relaxed mb-4 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}
      >
        {renderLexicalChildren(node, key)}
      </ListTag>
    )
  }

  if (type === 'listitem') {
    return (
      <li key={key}>
        {renderLexicalChildren(node, key)}
      </li>
    )
  }

  if (type === 'code') {
    const children = renderLexicalChildren(node, key)
    return (
      <pre
        key={key}
        className="bg-gray-900 text-gray-100 text-sm rounded-md p-4 overflow-x-auto mb-6"
      >
        <code>{children}</code>
      </pre>
    )
  }

  if (type === 'upload' && node.relationTo === 'media') {
    const media = node.value
    const src =
      media?.cloudinaryURL ||
      media?.url ||
      media?.thumbnailURL ||
      null

    if (!src) {
      return null
    }

    const alt = media?.alt || ''

    return (
      <figure key={key} className="w-full mb-6">
        {/* @ts-ignore */}
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="w-full lg:w-3/4 h-auto rounded-lg border border-gray-200 object-cover"
        />
      </figure>
    )
  }

  if (type === 'image') {
    const src = node.src || node.url || null
    if (!src) {
      return null
    }

    const alt = node.altText || node.alt || ''
    const caption = node.caption

    return (
      <figure key={key} className="w-full mb-6">
        {/* @ts-ignore */}
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="w-full lg:w-3/4 h-auto rounded-lg border border-gray-200 object-cover"
        />
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-500">
            {caption}
          </figcaption>
        )}
      </figure>
    )
  }

  if (type === 'course-image') {
    const src = node.url || null
    if (!src) {
      return null
    }

    const alt = node.alt || ''
    const caption = node.caption
    const mimeType = node.mimeType || ''

    const isPPT =
      mimeType === 'application/vnd.ms-powerpoint' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      /\.(ppt|pptx)$/i.test(src)

    if (isPPT) {
      return (
        <figure key={key} className="w-full mb-6">
          <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`}
              width="100%"
              height="100%"
              frameBorder="0"
              title={alt || 'Presentation'}
            >
              This browser does not support PDFs. Please download the PDF to view it:
              <a href={src}>Download PDF</a>
            </iframe>
          </div>
          <div className="mt-2 flex items-center justify-between">
            {caption && (
              <figcaption className="text-sm text-gray-500">{caption}</figcaption>
            )}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Download Presentation
            </a>
          </div>
        </figure>
      )
    }

    return (
      <figure key={key} className="w-full mb-6">
        {/* @ts-ignore */}
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="w-full lg:w-3/4 h-auto rounded-lg border border-gray-200 object-cover"
        />
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-500">
            {caption}
          </figcaption>
        )}
      </figure>
    )
  }

  return (
    <span key={key}>
      {renderLexicalChildren(node, key)}
    </span>
  )
}

function renderRichDescription(description: any): React.ReactNode {
  if (!description || typeof description !== 'object') {
    return null
  }

  const root = (description as any).root
  if (!root || !Array.isArray(root.children)) {
    return null
  }

  const rendered = root.children
    .map((node: any, index: number) => renderLexicalNode(node, `root-${index}`))
    .filter(Boolean)

  if (!rendered.length) {
    return null
  }

  return (
    <div className="space-y-1 text-gray-700 leading-relaxed">
      {rendered}
    </div>
  )
}

export function RichTextRenderer({
  blocks,
  content,
}: {
  blocks?: ContentBlock[] | null
  content?: any
}) {
  if (blocks && blocks.length > 0) {
    return (
      <div className="space-y-4 text-gray-700 leading-relaxed">
        {blocks.map((block, index) => {
          if (block.type === 'heading') return renderHeadingBlock(block, index)
          if (block.type === 'paragraph') return renderParagraphBlock(block, index)
          if (block.type === 'list') return renderListBlock(block, index)
          if (block.type === 'image') return renderImageBlock(block, index)
          if (block.type === 'quote') return renderQuoteBlock(block, index)
          if (block.type === 'code') return renderCodeBlock(block, index)
          return null
        })}
      </div>
    )
  }

  const rich = renderRichDescription(content)
  if (rich) {
    return rich
  }

  return <p className="text-gray-500 italic">No content available.</p>
}
