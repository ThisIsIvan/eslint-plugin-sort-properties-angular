const naturalCompare = require("natural-compare");
const { getStaticPropertyName } = require("./ast-utils");

/**
 * Sort metadata for a property. Kept outside the AST node so the rule never
 * mutates the shared AST (other rules and their fixers read the same nodes).
 * @typedef {object} Item
 * @property {any} node The original AST node.
 * @property {[number, number]} range Node range, widened to include comments.
 * @property {{ start: { line: number }, end: { line: number } }} loc Node loc, widened to include comments.
 * @property {number} [i] 1 if index signature.
 * @property {number} [f] Function priority coefficient.
 * @property {string} [n] Comparable name.
 * @property {string} [text] Source text including comments.
 */

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {(property: import('estree').Property) => boolean} breakWhen If true, the check will stop and ignore the current property.
 * @param {(property: import('estree').Property, previousProperty?: import('estree').Property) => boolean} splitWhen
 * If true, the check will split the properties ignoring the current one.\
 * previousProperty is undefined if the current property is the first one or if the previous property was ignored.
 */
function createCheck({ breakWhen, context, splitWhen, ts }) {
  const {
    allowLineSeparatedGroups = true,
    includeComments = "leading",
    minKeys = 2,

    // Sort options
    caseSensitive = true,
    functionOrder = "higher",
    natural = true,
    order = "asc",
  } = context.options[0] ?? {};
  const orderCoeff = order === "asc" ? 1 : -1;
  const funcCoeff =
    functionOrder === "higher" ? 1 : functionOrder === "lower" ? -1 : 0;

  const getPropertyName = caseSensitive
    ? (node) => getStaticPropertyName(node) ?? "\0"
    : (node) => getStaticPropertyName(node)?.toLowerCase() ?? "\0";

  /** Hydrate items with caching flags and name for saving time in comparison. */
  const hydrateItem = ts
    ? function hydrateTsItem(item) {
        const p = item.node;
        item.i = p.type === "TSIndexSignature" ? 1 : 0;
        item.f =
          funcCoeff *
          (p.type === "TSMethodSignature" ||
            p.typeAnnotation?.typeAnnotation.type === "TSFunctionType");
        item.n = getPropertyName(p);
      }
    : function hydrateJsItem(item) {
        const p = item.node;
        item.f =
          funcCoeff *
          (p.value?.type === "FunctionExpression" ||
            p.value?.type === "ArrowFunctionExpression");
        item.n = getPropertyName(p);
      };

  /** @returns {Item} */
  function createItem(p) {
    const item = {
      loc: { end: p.loc.end, start: p.loc.start },
      node: p,
      range: [p.range[0], p.range[1]],
    };
    if (includeComments.startsWith("l")) {
      // Include leading comments
      const comments = context.sourceCode.getCommentsBefore(p);
      if (comments.length) {
        item.range[0] = comments[0].range[0];
        item.loc.start = comments[0].loc.start;
      }
    } else if (includeComments.startsWith("t")) {
      // Include trailing comments
      const comments = context.sourceCode.getCommentsAfter(p);
      if (comments.length) {
        const comment = comments[comments.length - 1];
        item.range[1] = comment.range[1];
        item.loc.end = comment.loc.end;
      }
    }
    return item;
  }
  function compareItems(a, b) {
    if (a.i !== b.i) return a.i - b.i;
    if (a.f !== b.f) return a.f - b.f;
    if (natural) return naturalCompare(a.n, b.n);
    return a.n < b.n ? -1 : a.n > b.n ? 1 : 0;
  }
  /** @param {Item[]} items */
  function checkSlice(items) {
    if (items.length <= 1) return;
    hydrateItem(items[0]);
    const itemsWithoutFirst = items.slice(1);
    const outOfOrderIdx = itemsWithoutFirst.findIndex((item, i) => {
      hydrateItem(item);
      return orderCoeff * compareItems(items[i], item) > 0;
    });
    if (outOfOrderIdx < 0) return;
    const outOfOrder = itemsWithoutFirst[outOfOrderIdx].node;
    const sourceText = context.sourceCode.text;
    context.report({
      data: { name: getStaticPropertyName(outOfOrder) },
      messageId: "outOfOrder",
      node: outOfOrder.key,
      fix(fixer) {
        // hydrate rest of the items
        itemsWithoutFirst.slice(outOfOrderIdx).forEach(hydrateItem);
        items.forEach(
          (item) => (item.text = sourceText.slice(item.range[0], item.range[1]))
        );
        if (ts) {
          const last = items[items.length - 1];
          if (!last.text.endsWith(";") && !last.text.endsWith(",")) {
            last.text += ";";
          }
        }
        // Used to preserve whitespaces between properties.
        const textsInBetween = itemsWithoutFirst.map((item, i) =>
          sourceText.slice(items[i].range[1], item.range[0])
        );
        const sortedItems = items
          .slice()
          .sort((a, b) => orderCoeff * compareItems(a, b));
        const sortedText =
          sortedItems[0].text +
          sortedItems
            .slice(1)
            .map((item, i) => textsInBetween[i] + item.text)
            .join("");
        return fixer.replaceTextRange(
          [items[0].range[0], items[items.length - 1].range[1]],
          sortedText
        );
      },
    });
  }
  return function check(properties) {
    if (properties.length < minKeys) return;
    /** @type {Item[]} */
    let slice = [];
    for (const p of properties) {
      if (breakWhen?.(p)) break;
      const prev = slice[slice.length - 1];
      if (splitWhen?.(p, prev?.node)) {
        checkSlice(slice);
        slice = [];
        continue;
      }
      const item = createItem(p);
      if (
        allowLineSeparatedGroups &&
        prev &&
        prev.loc.end.line < item.loc.start.line - 1
      ) {
        checkSlice(slice);
        slice = [item];
        continue;
      }
      slice.push(item);
    }
    checkSlice(slice);
  };
}

module.exports = { createCheck };
