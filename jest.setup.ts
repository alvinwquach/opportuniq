import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { Blob as NodeBlob } from "buffer";

// Polyfill TextEncoder/TextDecoder for Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Polyfill Blob with arrayBuffer method for Node.js
if (typeof global.Blob === "undefined" || !global.Blob.prototype.arrayBuffer) {
  // @ts-expect-error - polyfill for Node environment
  global.Blob = NodeBlob;
}

// Polyfill URL.createObjectURL / revokeObjectURL for Node.js
if (typeof URL.createObjectURL !== "function") {
  let blobCounter = 0;
  const blobStore = new Map<string, Blob>();

  URL.createObjectURL = (blob: Blob) => {
    const id = `blob:nodetest:${++blobCounter}`;
    blobStore.set(id, blob);
    return id;
  };

  URL.revokeObjectURL = (url: string) => {
    blobStore.delete(url);
  };
}

// Polyfill Request/Response for API route tests
import { Request, Response, Headers } from "node-fetch";

// @ts-expect-error - polyfill for Node environment
global.Request = Request;
// @ts-expect-error - polyfill for Node environment
global.Response = Response;
// @ts-expect-error - polyfill for Node environment
global.Headers = Headers;

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/dashboard/diagnose",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null;
  rootMargin = "";
  thresholds = [];
  takeRecords() { return []; }
};

// Mock scrollIntoView (jsdom only)
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = jest.fn();
}
