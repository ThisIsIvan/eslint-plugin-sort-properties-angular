# sort-properties-angular/sort-object-expression

⚠️ This rule _warns_ in the following configs: 🌐 `all`, ![JavaScript](https://img.shields.io/badge/-JS-F7DF1E?style=flat-square) `js`.

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Examples

👎 Examples of **incorrect** code for this rule:

```ts
const obj = {
  method() {},
  callback: () => {},
  b: 1,
  a: 2,
};
```

👍 Examples of **correct** code for this rule:

```ts
const obj = {
  a: 2,
  b: 1,
  callback: () => {}, // Function properties will be placed after regular properties.
  method() {},
};
```

### Angular decorators

The metadata object of Angular class decorators (`@Component`, `@Directive`, `@Injectable`, `@NgModule`, `@Pipe` on a class declaration) is skipped, so [`@angular-eslint/sort-keys-in-type-decorator`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/sort-keys-in-type-decorator.md) can order it. Objects nested inside the metadata are still sorted.

👍 Examples of **correct** code with the default options:

```ts
@Component({
  selector: "app-x",
  imports: [Foo],
  templateUrl: "./x.html",
  host: { class: "x", role: "button" },
})
export class X {}
```

👎 Examples of **incorrect** code with the default options:

```ts
@Component({
  selector: "app-x",
  host: { role: "button", class: "x" }, // nested object is not sorted
})
export class X {}
```

## Options

<!-- begin auto-generated rule options list -->

| Name                       | Description                                                                                                                                                                                                                                                                                        | Type    | Choices                    | Default   |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------------------------- | :-------- |
| `allowLineSeparatedGroups` | If true, properties are separated independently by line breaks. Works same as [eslint sort-keys rule](https://eslint.org/docs/latest/rules/sort-keys#rule-details).                                                                                                                                | Boolean |                            | `true`    |
| `caseSensitive`            | Whether the comparison is case sensitive.                                                                                                                                                                                                                                                          | Boolean |                            | `true`    |
| `functionOrder`            | The priority of properties which values are either method or arrow function. For example, if order is 'asc' and functionOrder is 'higher', function properties will be placed at the end.                                                                                                          |         | `higher`, `lower`, `equal` | `higher`  |
| `ignoreAngularDecorators`  | Skip the metadata object of Angular class decorators (`@Component`, `@Directive`, `@Injectable`, `@NgModule`, `@Pipe`) so that `@angular-eslint/sort-keys-in-type-decorator` can sort it. Objects nested inside the metadata are still checked. Set to `false` to sort decorator metadata as well. | Boolean |                            | `true`    |
| `includeComments`          | Position of comments to consider as part of the property.                                                                                                                                                                                                                                          |         | `leading`, `trailing`      | `leading` |
| `minKeys`                  | Minimum number of keys to check order.                                                                                                                                                                                                                                                             | Integer |                            | `2`       |
| `natural`                  | Whether the comparison is using a natural order. See [natural-compare](https://www.npmjs.com/package/natural-compare)                                                                                                                                                                              | Boolean |                            | `true`    |
| `order`                    | The order of properties.                                                                                                                                                                                                                                                                           | String  | `asc`, `desc`              | `asc`     |

<!-- end auto-generated rule options list -->

### Option Examples

```js
// eslint.config.mjs
import { defineConfig } from "eslint/config";
import sortProperties from "eslint-plugin-sort-properties-angular";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    // TypeScript parser for .ts files (decorators, type annotations).
    files: ["**/*.ts"],
    languageOptions: { parser: tseslint.parser },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { "sort-properties-angular": sortProperties },
    rules: {
      "sort-properties-angular/sort-object-expression": [
        "error",
        {
          allowLineSeparatedGroups: false,
          caseSensitive: false,
          functionOrder: "lower",
          // Default. Leaves Angular decorator metadata to @angular-eslint/sort-keys-in-type-decorator.
          // Set to false only if you do not use that rule.
          ignoreAngularDecorators: true,
          minKeys: 3,
          natural: false,
          order: "desc",
        },
      ],
    },
  },
);
```
