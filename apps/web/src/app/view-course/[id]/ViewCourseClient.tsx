'use client';

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AuthorAvatar } from './AuthorAvatar'
import { CourseNavigationCarousel } from '@/components/CourseNavigationCarousel'
import type {
  Media,
  CourseWithInstructor,
  ContentBlock,
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  ImageBlock,
  QuoteBlock,
  CodeBlock,
} from '@/types/course'

interface ViewCourseClientProps {
  course: CourseWithInstructor;
}

// Helper function to get image URL - same pattern as CoursesGrid
function getImageUrl(media: Media | null | undefined): string | null {
  if (!media) return null

  return media.cloudinaryURL || media.url || media.thumbnailURL || null
}

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
    <p key={index} className="text-gray-700 leading-relaxed">
      {block.text}
    </p>
  )
}

function renderListBlock(block: ListBlock, index: number) {
  const ListTag = block.style === 'ordered' ? 'ol' : 'ul'
  return (
    <ListTag
      key={index}
      className="pl-5 space-y-1 text-gray-700 leading-relaxed"
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
  }

  return (
    <figure key={index} className="w-full">
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
      className="border-l-4 border-gray-300 pl-4 italic text-gray-700"
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
      className="bg-gray-900 text-gray-100 text-sm rounded-md p-4 overflow-x-auto"
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
    content = <code key={`${key}-code`}>{content}</code>
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
        <p key={key} className="text-gray-700 leading-relaxed">
          {renderLexicalChildren(node, key)}
        </p>
      )
    }

    return (
      <div key={key} className="space-y-4">
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
    const spacingClass = 'mt-6 mb-3'

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
        className="border-l-4 border-gray-300 pl-4 italic text-gray-700"
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
        className="pl-5 space-y-1 text-gray-700 leading-relaxed"
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
        className="bg-gray-900 text-gray-100 text-sm rounded-md p-4 overflow-x-auto"
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
      <figure key={key} className="w-full">
        {/* @ts-ignore */}
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="w-full h-auto rounded-lg border border-gray-200 object-cover"
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
      <figure key={key} className="w-full">
        {/* @ts-ignore */}
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="w-full h-auto rounded-lg border border-gray-200 object-cover"
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

    return (
      <figure key={key} className="w-full">
        {/* @ts-ignore */}
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="w-full h-auto rounded-lg border border-gray-200 object-cover"
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
    <div className="space-y-4 text-gray-700 leading-relaxed">
      {rendered}
    </div>
  )
}

function CourseDescriptionBlocks({
  blocks,
  description,
}: {
  blocks: ContentBlock[] | null | undefined
  description?: any
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

  const rich = renderRichDescription(description)
  if (rich) {
    return rich
  }

  return null
}

export default function ViewCourseClient({ course }: ViewCourseClientProps) {
  const [activeSection, setActiveSection] = useState('Overview')
  const [isDesktop, setIsDesktop] = useState(false)

  // Check screen size and adjust active section accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      const wasDesktop = isDesktop
      const desktop = window.innerWidth >= 1024
      setIsDesktop(desktop)

      // Only auto-switch when actually changing screen sizes, not on manual section selection
      if (wasDesktop !== desktop) {
        // If switching to desktop and currently on Overview, switch to Description
        if (desktop && activeSection === 'Overview') {
          setActiveSection('Description')
        }
        // If switching to mobile/tablet and currently on Description, switch to Overview
        else if (!desktop && activeSection === 'Description') {
          setActiveSection('Overview')
        }
      }
    };

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [isDesktop, activeSection])

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = isDesktop
        ? ['Description', 'Curriculum', 'Materials', 'Announcements']
        : ['Overview', 'Description', 'Curriculum', 'Materials', 'Announcements']
      const headerOffset = 150

      for (const section of sections) {
        const sectionId = section.toLowerCase().replace(/\s+/g, '-')
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= headerOffset && rect.bottom > headerOffset) {
            setActiveSection(section)
            break
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDesktop])

  const handleSectionChange = (section: string) => {
    setActiveSection(section)

    // Scroll to the corresponding section
    const sectionId = section.toLowerCase().replace(/\s+/g, '-')
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 120
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }



  // Helper function to format last updated date
  const formatLastUpdated = (updatedAt: string | null | undefined): string => {
    if (!updatedAt) return 'Not updated'

    try {
      const date = new Date(updatedAt)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  };

  // Helper function to format price
  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'Free'
    if (price === 0) return 'Free'

    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price)
  }

  const thumbnailImageUrl = getImageUrl(course.thumbnail)
  const altText = course.thumbnail?.alt || `${course.title} thumbnail`

  return (
    <div className="min-h-screen bg-white">


      {/* Breadcrumb Navigation */}
      <div className="w-full px-[10px] md:px-[15px] pt-4 pb-4">
        <nav className="flex items-center space-x-3 text-sm">
          {(Link as any)({
            href: '/',
            className:
              'text-gray-600 hover:text-[#201a7c] transition-all duration-200 font-medium',
            children: 'Home',
          })}
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#201a7c] font-semibold truncate max-w-xs">
            {course.title}
          </span>
        </nav>
      </div>

      {/* Course Header - Full Width Dark Section */}
      <div
        className="w-full text-white relative overflow-hidden"
        style={{
          background: '#201a7c'
        }}
      >
        {/* Maritime Background Pattern */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 200"><defs><pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse"><path d="M0,10 Q25,0 50,10 T100,10" stroke="%23ffffff" stroke-width="1" fill="none" opacity="0.3"/></pattern></defs><rect width="1200" height="200" fill="url(%23waves)"/><g opacity="0.4"><circle cx="150" cy="40" r="1.5" fill="%23ffffff"/><circle cx="350" cy="60" r="1" fill="%23ffffff"/><circle cx="550" cy="35" r="1.5" fill="%23ffffff"/><circle cx="750" cy="55" r="1" fill="%23ffffff"/><circle cx="950" cy="45" r="1.5" fill="%23ffffff"/></g><g opacity="0.6"><path d="M50,80 L70,85 L90,80 L110,85 L130,80" stroke="%23ffffff" stroke-width="1.5" fill="none"/><path d="M200,90 L220,95 L240,90 L260,95 L280,90" stroke="%23ffffff" stroke-width="1.5" fill="none"/><path d="M400,75 L420,80 L440,75 L460,80 L480,75" stroke="%23ffffff" stroke-width="1.5" fill="none"/></g><g opacity="0.3"><polygon points="100,120 110,110 120,120 110,130" fill="%23ffffff"/><polygon points="300,130 310,120 320,130 310,140" fill="%23ffffff"/><polygon points="500,115 510,105 520,115 510,125" fill="%23ffffff"/><polygon points="700,125 710,115 720,125 710,135" fill="%23ffffff"/><polygon points="900,110 910,100 920,110 910,120" fill="%23ffffff"/></g><path d="M0,160 Q200,140 400,160 T800,160 Q1000,140 1200,160 L1200,200 L0,200 Z" fill="%23ffffff" opacity="0.1"/></svg>')`
          }}
        />
        <div className="relative z-10 max-w-7xl px-2.5 md:px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left Content */}
            <div className="flex-1">
              {/* Course Title */}
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>

              {course.excerpt && (
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {course.excerpt}
                </p>
              )}

              {/* Author Information */}
              {course.instructor && course.instructor.user && (
                <div className="flex items-center space-x-3 mb-6">
                  <AuthorAvatar user={course.instructor.user} />
                  <div>
                    <p className="text-white font-medium">
                      A course by {course.instructor.user.firstName} {course.instructor.user.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {course.instructor.specialization}
                    </p>
                  </div>
                </div>
              )}

              {/* Course Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-300">
                <span>Last Updated: {formatLastUpdated(course.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>




      {/* Course Content Sections - Two Column Layout */}
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full lg:pr-5">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content - Left Column */}
            <div className="flex-1 lg:flex-[1_1_0%] min-w-0">
              {/* Course Navigation Carousel - Sticky positioned below header */}
              <div className="sticky top-[45px] lg:top-16 z-40 mb-8">
                <CourseNavigationCarousel
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />
              </div>

              {/* Overview Section - Hidden on desktop */}
              <div id="overview" className="lg:hidden bg-white rounded-lg shadow-sm px-2.5 pt-2.5 pb-8 mb-8">
                {/* Mobile/Tablet Course Card - Only visible on smaller screens */}
                {thumbnailImageUrl && (
                  <div className="lg:hidden">
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                      {/* @ts-ignore */}
                      <Image
                        src={thumbnailImageUrl}
                        alt={altText}
                        width={320}
                        height={180}
                        className="w-full h-45 object-cover"
                      />

                      {/* Price and Action */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-red-500 text-sm line-through">{formatPrice(course.price)}</span>
                            <div className="text-2xl font-bold text-gray-900">{formatPrice(course.discountedPrice)}</div>
                          </div>
                          <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded" style={{ backgroundColor: '#f5f5f5', color: '#333' }}>
                            {course.category?.map(c => c.name).join(', ') || 'General'}
                          </span>
                        </div>

                        <button className="w-full bg-white hover:bg-[#201a7c] text-[#201a7c] hover:text-white font-medium py-3 px-4 rounded-lg mb-3 transition-colors border border-[#201a7c]">
                          ▶ Start Learning
                        </button>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div>100% positive reviews</div>
                          <div>0 student</div>
                          <div>1 lesson</div>
                          <div>Language: English</div>
                          <div>0 quiz</div>
                          <div>Assessments: Yes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div id="description" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Course Description
                </h2>
                <CourseDescriptionBlocks
                  blocks={course.descriptionBlocks || null}
                  description={course.description}
                />
              </div>

              {/* Additional content sections can be added here */}
              <div id="curriculum" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
                <p className="text-gray-700">
                  Course curriculum content will be displayed here.
                </p>
              </div>


              <div id="materials" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Materials</h2>
                <p className="text-gray-700">
                  Course materials and resources will be displayed here.
                </p>
              </div>

              <div id="announcements" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Announcements</h2>
                <p className="text-gray-700">
                  Course announcements and updates will be displayed here.
                </p>
              </div>
            </div>

            {/* Sticky Sidebar - Right Column - Hidden on mobile/tablet */}
            <div className="hidden lg:block lg:flex-[0_0_320px] lg:max-w-[320px]">
              <div className="sticky top-20 -mt-55">
                {thumbnailImageUrl && (
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-4">
                    {/* @ts-ignore */}
                    <Image
                      src={thumbnailImageUrl}
                      alt={altText}
                      width={320}
                      height={180}
                      className="w-full h-45 object-cover"
                    />

                    {/* Price and Action */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-red-500 text-sm line-through">{formatPrice(course.price)}</span>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(course.discountedPrice)}
                          </div>
                        </div>
                        <span
                          className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: '#f5f5f5', color: '#333' }}
                        >
                          {course.category?.map(c => c.name).join(', ') || 'General'}
                        </span>
                      </div>

                      <button className="w-full bg-white hover:bg-[#201a7c] text-[#201a7c] hover:text-white font-medium py-3 px-4 rounded-lg mb-3 transition-colors border border-[#201a7c]">
                        ▶ Start Learning
                      </button>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div>100% positive reviews</div>
                        <div>0 student</div>
                        <div>1 lesson</div>
                        <div>Language: English</div>
                        <div>0 quiz</div>
                        <div>Assessments: Yes</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
