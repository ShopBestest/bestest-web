import { defineConfig } from 'vitest/config';

// Pure-logic and in-process end-to-end tests run on Node (Node 20+ has the
// web-standard Request/Response/fetch the Worker relies on). No workerd needed.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node'
  }
});
