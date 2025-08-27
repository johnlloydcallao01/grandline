// Fix React 19 type compatibility issues
declare module 'react' {
  namespace React {
    type ReactNode = any;
    type Element = any;
    type JSX = any;
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
  }
}

// Global JSX namespace fix
declare global {
  namespace JSX {
    interface Element {
      type: any;
      props: any;
      key: any;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Fix Next.js Image component type issues
declare module 'next/image' {
  import { ComponentType } from 'react';

  interface ImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    sizes?: string;
    quality?: number;
    loading?: 'lazy' | 'eager';
    unoptimized?: boolean;
    onLoad?: () => void;
    onError?: () => void;
    style?: React.CSSProperties;
  }

  declare const Image: ComponentType<ImageProps> & {
    (props: ImageProps): JSX.Element;
  };
  export default Image;
}

export {};
