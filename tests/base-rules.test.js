const { describe, it } = require("node:test");
const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");
const plugin = require("..");

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });
const outOfOrder = (name) => ({ data: { name }, messageId: "outOfOrder" });

ruleTester.run("sort-object-expression", plugin.rules["sort-object-expression"], {
  invalid: [
    {
      code: `const o = { b: 1, a: 2 };`,
      errors: [outOfOrder("a")],
      output: `const o = { a: 2, b: 1 };`,
    },
    {
      code: `const o = {\n  // about b\n  b: 1,\n  // about a\n  a: 2,\n};`,
      errors: [outOfOrder("a")],
      name: "leading comments move with their property",
      output: `const o = {\n  // about a\n  a: 2,\n  // about b\n  b: 1,\n};`,
    },
    {
      // Known upstream limitation: comments after the comma are not captured.
      code: `const o = { b: 1 /* about b */, a: 2 /* about a */ };`,
      errors: [outOfOrder("a")],
      name: "trailing comments move with their property",
      options: [{ includeComments: "trailing" }],
      output: `const o = { a: 2 /* about a */, b: 1 /* about b */ };`,
    },
    {
      code: `const o = { fn() {}, cb: () => {}, b: 1 };`,
      errors: [outOfOrder("cb")],
      name: "functions go last by default",
      output: `const o = { b: 1, cb: () => {}, fn() {} };`,
    },
    {
      code: `const o = { b: 1, a: 2, ...rest, d: 1, c: 2 };`,
      errors: [outOfOrder("a"), outOfOrder("c")],
      name: "spread splits groups",
      output: `const o = { a: 2, b: 1, ...rest, c: 2, d: 1 };`,
    },
    {
      code: `const o = { a10: 1, a9: 2 };`,
      errors: [outOfOrder("a9")],
      name: "natural order",
      output: `const o = { a9: 2, a10: 1 };`,
    },
  ],
  valid: [
    `const o = { a: 1, b: 2, c() {} };`,
    {
      code: `const o = {\n  b: 1,\n\n  a: 2,\n};`,
      name: "line separated groups are independent",
    },
    {
      code: `const o = { b: 1, a: 2 };`,
      name: "desc order",
      options: [{ order: "desc" }],
    },
  ],
});

ruleTester.run("sort-object-destructing", plugin.rules["sort-object-destructing"], {
  invalid: [
    {
      code: `const { b, a, ...rest } = o;`,
      errors: [outOfOrder("a")],
      output: `const { a, b, ...rest } = o;`,
    },
  ],
  valid: [`const { a, b, ...rest } = o;`],
});

ruleTester.run("sort-interface", plugin.rules["sort-interface"], {
  invalid: [
    {
      code: `interface I { b: string; fn(): void; a: number }`,
      errors: [outOfOrder("a")],
      name: "adds missing separator to the moved last member",
      output: `interface I { a: number; b: string; fn(): void; }`,
    },
  ],
  valid: [`interface I { a: number; b: string; [k: string]: unknown }`],
});

ruleTester.run("sort-type-literal", plugin.rules["sort-type-literal"], {
  invalid: [
    {
      code: `type T = { b: string; a: number };`,
      errors: [outOfOrder("a")],
      output: `type T = { a: number; b: string; };`,
    },
  ],
  valid: [`type T = { a: number; b: string };`],
});
