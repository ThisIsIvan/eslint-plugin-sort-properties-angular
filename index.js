const { PLUGIN_NAMESPACE: ns, version } = require("./rules/constants/meta");

/** Set by `pnpm docgen` (eslint-doc-generator). */
const docgen = Boolean(process.env.DOCGEN);

const jsRules = {
  [`${ns}/sort-object-destructing`]: "warn",
  [`${ns}/sort-object-expression`]: "warn",
};

const tsRules = {
  [`${ns}/sort-interface`]: "warn",
  [`${ns}/sort-type-literal`]: "warn",
};

const allRules = Object.fromEntries(
  Object.entries({ ...jsRules, ...tsRules }).sort(([a], [b]) =>
    a.localeCompare(b)
  )
);

/** Single source of truth for the bundled configs. */
const configTable = {
  all: {
    description: `Enable all rules of the \`${ns}\` plugin.`,
    rules: allRules,
  },
  js: {
    description: `Enable the JavaScript rules (object expressions and destructuring).`,
    rules: jsRules,
  },
  ts: {
    description: `Enable the TypeScript rules (interfaces and type literals).`,
    rules: tsRules,
  },
};

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  configs: {},
  meta: { name: `eslint-plugin-${ns}`, version },
  rules: {
    "sort-interface": require("./rules/sort-interface"),
    "sort-object-destructing": require("./rules/sort-object-destructing"),
    "sort-object-expression": require("./rules/sort-object-expression"),
    "sort-type-literal": require("./rules/sort-type-literal"),
  },
};

/** Flat configs. `flat/*` are kept as aliases for compatibility with the original plugin. */
for (const [key, { description, rules }] of Object.entries(configTable)) {
  if (docgen) {
    // eslint-doc-generator cannot handle the circular plugin reference.
    plugin.configs[key] = { meta: { docs: { description } }, rules };
    continue;
  }
  // Separate objects per name, so modifying one config does not affect the other.
  for (const name of [key, `flat/${key}`]) {
    plugin.configs[name] = {
      name: `${ns}/${name}`,
      plugins: { [ns]: plugin },
      rules: { ...rules },
    };
  }
}

module.exports = plugin;
