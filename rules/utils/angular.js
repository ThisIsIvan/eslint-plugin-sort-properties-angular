/**
 * Angular class decorators whose metadata object is sorted by
 * `@angular-eslint/sort-keys-in-type-decorator`.
 *
 * Kept in sync with the `DEFAULT_ORDER` keys of that rule.
 * @see https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/sort-keys-in-type-decorator.md
 */
const ANGULAR_TYPE_DECORATORS = Object.freeze([
  "Component",
  "Directive",
  "Injectable",
  "NgModule",
  "Pipe",
]);

/**
 * Returns the decorator name if `node` is the metadata object of one of the
 * {@link ANGULAR_TYPE_DECORATORS}, i.e. the first argument of `@Name({...})` on a class.
 *
 * Mirrors the selector used by `@angular-eslint/sort-keys-in-type-decorator`
 * (`ClassDeclaration > Decorator[expression.callee.name="Name"]` plus
 * `getDecoratorArgument`), so exactly the objects that rule sorts are matched.
 * Nested objects (e.g. `host: {...}`, `{ provide, useClass }`) never match.
 *
 * @param {import('estree').ObjectExpression} node
 * @returns {string | undefined}
 */
function getAngularTypeDecoratorName(node) {
  const call = node.parent;
  if (
    !call ||
    call.type !== "CallExpression" ||
    call.arguments[0] !== node ||
    call.callee.type !== "Identifier"
  ) {
    return undefined;
  }
  const decorator = call.parent;
  if (
    !decorator ||
    decorator.type !== "Decorator" ||
    decorator.expression !== call
  ) {
    return undefined;
  }
  // Only class declarations: the Angular rule ignores class expressions, so
  // skipping those here would leave them unchecked by both rules.
  if (decorator.parent?.type !== "ClassDeclaration") return undefined;
  return ANGULAR_TYPE_DECORATORS.includes(call.callee.name)
    ? call.callee.name
    : undefined;
}

module.exports = { ANGULAR_TYPE_DECORATORS, getAngularTypeDecoratorName };
