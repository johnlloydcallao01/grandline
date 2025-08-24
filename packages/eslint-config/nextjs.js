const baseConfig = require("./base.js");

module.exports = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
