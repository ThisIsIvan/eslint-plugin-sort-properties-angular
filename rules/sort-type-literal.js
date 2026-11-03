const baseMessage = require("./constants/base-message");
const { baseSchema } = require("./constants/base-option");
const { ruleDocUrl } = require("./constants/meta");
const { createCheck } = require("./utils/check");

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    defaultOptions: [baseSchema.default],
    docs: {
      category: "Stylistic Issues",
      description: "Enforce properties in type literals to be sorted.",
      recommended: true,
      url: ruleDocUrl("sort-type-literal"),
    },
    fixable: "code",
    hasSuggestions: true,
    messages: baseMessage,
    schema: [baseSchema],
    type: "suggestion",
  },
  create(context) {
    context.ts = true;
    const check = createCheck({ context, ts: true });
    return {
      TSTypeLiteral(node) {
        // Exclude {[key: {Key}]: {Value}} pattern because this type of signature can exist only once.
        if (node.members.some((p) => p.key?.type === "BinaryExpression"))
          return;
        check(node.members);
      },
    };
  },
};
