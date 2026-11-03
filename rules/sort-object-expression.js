const baseMessage = require("./constants/base-message");
const { baseSchema } = require("./constants/base-option");
const { getAngularTypeDecoratorName } = require("./utils/angular");
const { ruleDocUrl } = require("./constants/meta");
const { createCheck } = require("./utils/check");

/** @type {import('json-schema').JSONSchema4} */
const schema = {
  ...baseSchema,
  default: {
    ...baseSchema.default,
    ignoreAngularDecorators: true,
  },
  properties: {
    ...baseSchema.properties,
    ignoreAngularDecorators: {
      default: true,
      description:
        "Skip the metadata object of Angular class decorators (`@Component`, `@Directive`, `@Injectable`, `@NgModule`, `@Pipe`) so that `@angular-eslint/sort-keys-in-type-decorator` can sort it. Objects nested inside the metadata are still checked. Set to `false` to sort decorator metadata as well.",
      type: "boolean",
    },
  },
};

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    defaultOptions: [schema.default],
    docs: {
      category: "Stylistic Issues",
      description:
        "Enforce properties in object expressions to be sorted, skipping Angular decorator metadata.",
      recommended: true,
      url: ruleDocUrl("sort-object-expression"),
    },
    fixable: "code",
    hasSuggestions: true,
    messages: baseMessage,
    schema: [schema],
    type: "suggestion",
  },
  create(context) {
    const ignoreAngular = context.options[0]?.ignoreAngularDecorators ?? true;
    const check = createCheck({
      context,
      splitWhen: (p) => p.type === "SpreadElement",
    });
    return {
      ObjectExpression(node) {
        if (ignoreAngular && getAngularTypeDecoratorName(node)) {
          return;
        }
        check(node.properties);
      },
    };
  },
};
