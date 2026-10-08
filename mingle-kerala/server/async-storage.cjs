// Next.js 15 needs the Node AsyncLocalStorage implementation before its
// App Router server modules are evaluated by the custom tsx entrypoint.
const { AsyncLocalStorage } = require("node:async_hooks");

globalThis.AsyncLocalStorage = AsyncLocalStorage;