
import React from 'react';
import {
  DecoratorNode,
  type SerializedLexicalNode,
  type NodeKey,
  type EditorConfig,
  type DOMExportOutput,
  type DOMConversionMap,
} from 'lexical';

export type SharedMediaItem = {
  id: string;
  url: string;
  alt?: string;
  mimeType?: string;
};

type PayloadMediaDoc = {
  id?: unknown;
  _id?: unknown;
  filename?: unknown;
  cloudinaryURL?: unknown;
  thumbnailURL?: unknown;
  url?: unknown;
  alt?: unknown;
  mimeType?: unknown;
};

export function mapPayloadMediaDocsToSharedMediaItems(docs: unknown): SharedMediaItem[] {
  const list = Array.isArray(docs) ? (docs as PayloadMediaDoc[]) : [];
  return list
    .filter((d) => {
      if (typeof d?.mimeType !== 'string') return true;
      return (
        d.mimeType.startsWith('image/') ||
        d.mimeType === 'application/vnd.ms-powerpoint' ||
        d.mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        d.mimeType === 'application/x-cfb'
      );
    })
    .map((d) => ({
      id: String(d.id ?? d._id ?? d.filename ?? Math.random().toString(36)),
      url: String(d.cloudinaryURL ?? d.thumbnailURL ?? d.url ?? ''),
      alt: typeof d.alt === 'string' ? d.alt : '',
      mimeType: typeof d.mimeType === 'string' ? d.mimeType : '',
    }));
}

type ImageNodeJSON = {
  type: 'course-image';
  version: 1;
  url: string;
  alt?: string;
  caption?: string;
  width?: string;
  height?: string;
  mimeType?: string;
} & SerializedLexicalNode;

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __url: string;
  __alt: string;
  __caption: string;
  __width: string;
  __height: string;
  __mimeType: string;

  static getType() {
    return 'course-image';
  }

  static clone(node: ImageNode) {
    return new ImageNode(
      node.__url,
      node.__alt,
      node.__caption,
      node.__width,
      node.__height,
      node.__mimeType,
      node.__key,
    );
  }

  constructor(
    url: string,
    alt = '',
    caption = '',
    width?: string,
    height?: string,
    mimeType?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__url = url;
    this.__alt = alt;
    this.__caption = caption;
    this.__width = width || '';
    this.__height = height || '';
    this.__mimeType = mimeType || '';
  }

  static importJSON(serializedNode: ImageNodeJSON) {
    const { url, alt, caption, width, height, mimeType } = serializedNode;
    return new ImageNode(url, alt || '', caption || '', width, height, mimeType);
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
      mimeType: this.__mimeType || undefined,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = this.createDOM({ theme: {} } as any);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: (domNode: Node) => {
          if (domNode instanceof HTMLImageElement) {
            const { src, alt, width, height } = domNode;
            const node = new ImageNode(src, alt, undefined, String(width || ''), String(height || ''));
            return { node };
          }
          return null;
        },
        priority: 0,
      }),
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

    const isImage =
      !this.__mimeType ||
      this.__mimeType.startsWith('image/') ||
      this.__url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);

    if (isImage) {
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
    } else {
      // Render file card for PPT/Docs
      const card = document.createElement('a');
      card.href = this.__url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.gap = '12px';
      card.style.padding = '12px';
      card.style.border = '1px solid #e5e7eb';
      card.style.borderRadius = '8px';
      card.style.backgroundColor = '#f9fafb';
      card.style.textDecoration = 'none';
      card.style.color = 'inherit';
      card.style.width = '100%';
      card.style.maxWidth = '400px';

      const icon = document.createElement('div');
      icon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-presentation"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M2 15h10"/><path d="m2 15 2 6"/><path d="m12 15-2 6"/></svg>';
      icon.style.color = '#e11d48'; // Rose color for PPT

      const info = document.createElement('div');
      info.style.display = 'flex';
      info.style.flexDirection = 'column';

      const title = document.createElement('span');
      title.textContent = this.__alt || 'Presentation File';
      title.style.fontWeight = '500';
      title.style.fontSize = '14px';

      const type = document.createElement('span');
      type.textContent = 'PowerPoint Presentation';
      type.style.fontSize = '12px';
      type.style.color = '#6b7280';

      info.appendChild(title);
      info.appendChild(type);
      card.appendChild(icon);
      card.appendChild(info);
      figure.appendChild(card);
    }

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
    if (
      prevNode.__width === this.__width &&
      prevNode.__height === this.__height &&
      prevNode.__url === this.__url
    ) {
      return false;
    }
    // Re-create DOM if URL changes or type changes significantly
    // For simplicity, we can return true to force re-render if fundamental props change
    // But for width/height on images, we can optimize
    const isImage =
      !this.__mimeType ||
      this.__mimeType.startsWith('image/') ||
      this.__url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);

    if (isImage) {
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
        if (img.src !== this.__url) img.src = this.__url;
      } else {
        return true; // Structure changed
      }
    } else {
      // Check if we have a card
      const card = dom.querySelector('a');
      if (!card) return true; // Structure changed
      if (card.href !== this.__url) card.href = this.__url;
    }
    return false;
  }

  decorate() {
    return null;
  }
}

export type IframeNodeJSON = {
  type: 'iframe';
  version: 1;
  src: string;
  width?: string;
  height?: string;
} & SerializedLexicalNode;

export class IframeNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __width: string;
  __height: string;

  static getType() {
    return 'iframe';
  }

  static clone(node: IframeNode) {
    return new IframeNode(
      node.__src,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  constructor(
    src: string,
    width = '100%',
    height = '400px',
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__width = width;
    this.__height = height;
  }

  static importJSON(serializedNode: IframeNodeJSON) {
    const { src, width, height } = serializedNode;
    return new IframeNode(src, width, height);
  }

  exportJSON(): IframeNodeJSON {
    return {
      ...super.exportJSON(),
      type: 'iframe',
      version: 1,
      src: this.__src,
      width: this.__width,
      height: this.__height,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = this.createDOM({ theme: {} } as any);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (node: Node) => ({
        conversion: (domNode: Node) => {
          if (domNode instanceof HTMLIFrameElement) {
            const { src, width, height } = domNode;
            const node = new IframeNode(src, width, height);
            return { node };
          }
          return null;
        },
        priority: 1,
      }),
    };
  }

  createDOM(config: EditorConfig) {
    const element = document.createElement('iframe');
    element.src = this.__src;
    element.frameBorder = '0';
    element.allowFullscreen = true;

    const wStr = this.__width;
    const hStr = this.__height;

    // Check if dimensions are percentage-based
    if (wStr.includes('%') || hStr.includes('%')) {
      element.style.width = wStr;
      element.style.height = hStr;
      element.width = wStr.replace('%', ''); // Attribute fallback often ignored for % but harmless
      element.height = hStr.replace('%', '');
    } else {
      // Try to parse pixel values
      const w = parseInt(wStr, 10);
      const h = parseInt(hStr, 10);

      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        // Use aspect-ratio to maintain proportions while being responsive
        element.style.aspectRatio = `${w} / ${h}`;
        element.style.width = '100%';
        element.style.maxWidth = `${w}px`;
        element.style.height = 'auto';
        
        // Set attributes as fallback
        element.width = String(w);
        element.height = String(h);
      } else {
        // Fallback to attribute setting if parsing fails
        element.width = wStr;
        element.height = hStr;
      }
    }
    
    return element;
  }

  updateDOM(prevNode: IframeNode, dom: HTMLElement) {
    if (
      prevNode.__src !== this.__src ||
      prevNode.__width !== this.__width ||
      prevNode.__height !== this.__height
    ) {
      const iframe = dom as HTMLIFrameElement;
      iframe.src = this.__src;
      
      const wStr = this.__width;
      const hStr = this.__height;

      // Clear previous styles to avoid conflicts
      iframe.style.width = '';
      iframe.style.height = '';
      iframe.style.maxWidth = '';
      iframe.style.aspectRatio = '';
      iframe.removeAttribute('width');
      iframe.removeAttribute('height');

      if (wStr.includes('%') || hStr.includes('%')) {
        iframe.style.width = wStr;
        iframe.style.height = hStr;
        iframe.width = wStr.replace('%', '');
        iframe.height = hStr.replace('%', '');
      } else {
        const w = parseInt(wStr, 10);
        const h = parseInt(hStr, 10);

        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
          iframe.style.aspectRatio = `${w} / ${h}`;
          iframe.style.width = '100%';
          iframe.style.maxWidth = `${w}px`;
          iframe.style.height = 'auto';
          iframe.width = String(w);
          iframe.height = String(h);
        } else {
          iframe.width = wStr;
          iframe.height = hStr;
        }
      }
    }
    return false;
  }

  decorate() {
    return null;
  }
}

export function $createImageNode(config: { url: string; alt?: string; mimeType?: string }) {
  return new ImageNode(config.url, config.alt || '', undefined, undefined, undefined, config.mimeType);
}
