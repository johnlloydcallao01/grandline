const base = require("@encreasl/eslint-config/nextjs.js");

module.exports = Array.isArray(base)
  ? [...base, { ignores: ["src/payload-types.ts"] }]
  : [{ ignores: ["src/payload-types.ts"] }, base];
