/// <reference types="vite/client" />

import { Buffer } from 'buffer'

declare global {
  interface Window {
    global: typeof globalThis
    Buffer: typeof Buffer
  }
}

export {}

