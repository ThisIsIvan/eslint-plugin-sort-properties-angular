const { PLUGIN_NAMESPACE: ns, version } = require("./rules/constants/meta");

const allRules = {
  [`${ns}/sort-interface`]: ["warn"],
  [`${ns}/sort-object-destructing`]: ["warn"],
  [`${ns}/sort-object-expression`]: ["warn"],
  [`${ns}/sort-type-literal`]: ["warn"],
};

const jsRules = {
  [`${ns}/sort-object-destructing`]: ["warn"],
  [`${ns}/sort-object-expression`]: ["warn"],
};

const tsRules = {
  [`${ns}/sort-interface`]: ["warn"],
  [`${ns}/sort-type-literal`]: ["warn"],
};

/** @type {import('eslint').ESLint.Plugin} */
module.exports = {
  configs: {
    all: {
      plugins: [ns],
      rules: allRules,
    },
    js: {
      plugins: [ns],
      rules: jsRules,
    },
    ts: {
      plugins: [ns],
      rules: tsRules,
    },
  },
  meta: { name: `eslint-plugin-${ns}`, version },
  rules: {
    "sort-interface": require("./rules/sort-interface"),
    "sort-object-destructing": require("./rules/sort-object-destructing"),
    "sort-object-expression": require("./rules/sort-object-expression"),
    "sort-type-literal": require("./rules/sort-type-literal"),
  },
};
if (process?.env?.DOCGEN) {
  module.exports.configs.all.meta = {
    docs: {
      description: `Apply all rules in the \`${ns}\` plugin. Use \`flat/all\` in eslint>=9`,
    },
  };
  module.exports.configs.js.meta = {
    docs: {
      description: `Apply JavaScript rules in the \`${ns}\` plugin. Use \`flat/js\` in eslint>=9`,
    },
  };
  module.exports.configs.ts.meta = {
    docs: {
      description: `Apply TypeScript rules in the \`${ns}\` plugin. Use \`flat/ts\` in eslint>=9`,
    },
  };
}

if (!process?.env?.DOCGEN) {
  module.exports.configs["flat/all"] = {
    plugins: { [ns]: module.exports },
    rules: allRules,
  };
  module.exports.configs["flat/js"] = {
    plugins: { [ns]: module.exports },
    rules: jsRules,
  };
  module.exports.configs["flat/ts"] = {
    plugins: { [ns]: module.exports },
    rules: tsRules,
  };
}
