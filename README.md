# eslint-plugin-sort-properties-angular

An Angular-aware fork of [eslint-plugin-sort-properties](https://github.com/haenah/eslint-plugin-sort-properties) by [haenah](https://github.com/haenah).

It sorts object expressions, object destructuring, type literals and interface members by key, just like the original. The difference: **it leaves the metadata object of Angular class decorators alone**, so it can be used side by side with [`@angular-eslint/sort-keys-in-type-decorator`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/sort-keys-in-type-decorator.md) without the two rules fighting over the same object.

```ts
@Component({
  selector: 'app-user',          // ┐
  imports: [UserCard],           // │ ordered by @angular-eslint/sort-keys-in-type-decorator,
  templateUrl: './user.html',    // │ skipped by this plugin
  changeDetection: OnPush,       // │
  host: {                        // ┘
    class: 'user',               // ┐ nested objects are still sorted
    role: 'listitem',            // ┘ alphabetically by this plugin
  },
  providers: [{ provide: A, useClass: B }], // ← sorted by this plugin
})
export class UserComponent {}
```

## What is skipped exactly

Only the first-argument object of `@Component`, `@Directive`, `@Injectable`, `@NgModule` and `@Pipe` when the decorator is applied to a **class declaration**. This mirrors the selector used by `sort-keys-in-type-decorator`, so every object is checked by exactly one of the two rules:

| Object                                                             | Checked by                    |
| :----------------------------------------------------------------- | :---------------------------- |
| `@Component({ ... })` / `@Directive` / `@Injectable` / `@NgModule` / `@Pipe` on a class declaration | `sort-keys-in-type-decorator` |
| Objects nested inside that metadata (`host`, providers, ...)       | this plugin                   |
| Other decorators (`@Input({...})`, custom decorators)              | this plugin                   |
| Decorators on class expressions (`const A = @Component({...}) class {}`) | this plugin (the Angular rule ignores them) |
| Plain calls (`Component({...})`)                                   | this plugin                   |

The list of skipped decorators is configurable with the `ignoreAngularDecorators` option of [`sort-object-expression`](docs/rules/sort-object-expression.md). If you configure `sort-keys-in-type-decorator` without one of the decorators, remove it from `ignoreAngularDecorators` too, otherwise that metadata is unchecked.

## Other changes compared to the original

- Rules no longer mutate AST nodes (the original widened `range`/`loc` of property nodes to include comments and stored cache fields on them). This could leak into other rules' fixers and is rejected by ESLint 10's `RuleTester`.
- Fixed an invalid JSON schema (`required: false` on `includeComments`).
- Added a test suite (`pnpm test`).
- Supports ESLint 9 and 10 (flat config).

## Rules

<!-- begin auto-generated rules list -->

⚠️ Configurations set to warn in.\
🌐 Set in the `all` configuration.\
![JavaScript](https://img.shields.io/badge/-JS-F7DF1E?style=flat-square) Set in the `js` configuration.\
![TypeScript](https://img.shields.io/badge/-TS-007ACC?style=flat-square) Set in the `ts` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

| Name                                                                                                                                             | Description                                                                                 | ⚠️                                                                          | 🔧 | 💡 |
| :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------- | :- | :- |
| [sort-interface](https://github.com/ThisIsIvan/eslint-plugin-sort-properties-angular/blob/v1.0.0/docs/rules/sort-interface.md)                   | Enforce interface members to be sorted.                                                     | 🌐 ![TypeScript](https://img.shields.io/badge/-TS-007ACC?style=flat-square) | 🔧 | 💡 |
| [sort-object-destructing](https://github.com/ThisIsIvan/eslint-plugin-sort-properties-angular/blob/v1.0.0/docs/rules/sort-object-destructing.md) | Enforce properties in object destructuring to be sorted.                                    | 🌐 ![JavaScript](https://img.shields.io/badge/-JS-F7DF1E?style=flat-square) | 🔧 | 💡 |
| [sort-object-expression](https://github.com/ThisIsIvan/eslint-plugin-sort-properties-angular/blob/v1.0.0/docs/rules/sort-object-expression.md)   | Enforce properties in object expressions to be sorted, skipping Angular decorator metadata. | 🌐 ![JavaScript](https://img.shields.io/badge/-JS-F7DF1E?style=flat-square) | 🔧 | 💡 |
| [sort-type-literal](https://github.com/ThisIsIvan/eslint-plugin-sort-properties-angular/blob/v1.0.0/docs/rules/sort-type-literal.md)             | Enforce properties in type literals to be sorted.                                           | 🌐 ![TypeScript](https://img.shields.io/badge/-TS-007ACC?style=flat-square) | 🔧 | 💡 |

<!-- end auto-generated rules list -->

## Installation

```bash
pnpm add -D eslint eslint-plugin-sort-properties-angular
```

## Available configurations

<!-- begin auto-generated configs list -->

|                                                                          | Name  | Description                                                                                |
| :----------------------------------------------------------------------- | :---- | :----------------------------------------------------------------------------------------- |
| 🌐                                                                       | `all` | Apply all rules in the `sort-properties-angular` plugin. Use `flat/all` in eslint>=9       |
| ![JavaScript](https://img.shields.io/badge/-JS-F7DF1E?style=flat-square) | `js`  | Apply JavaScript rules in the `sort-properties-angular` plugin. Use `flat/js` in eslint>=9 |
| ![TypeScript](https://img.shields.io/badge/-TS-007ACC?style=flat-square) | `ts`  | Apply TypeScript rules in the `sort-properties-angular` plugin. Use `flat/ts` in eslint>=9 |

<!-- end auto-generated configs list -->

## Configuration (`eslint.config.js`)

> **Note**\
> TypeScript rules (`sort-interface`, `sort-type-literal`) and decorators need `@typescript-eslint/parser` (e.g. via `typescript-eslint`).

```js
import sortProperties from "eslint-plugin-sort-properties-angular";

export default [
  // ...
  sortProperties.configs["flat/all"],
  {
    rules: {
      "@angular-eslint/sort-keys-in-type-decorator": "error",
    },
  },
];
```

or enable specific rules:

```js
import sortProperties from "eslint-plugin-sort-properties-angular";

export default [
  {
    plugins: { "sort-properties-angular": sortProperties },
    rules: {
      "sort-properties-angular/sort-interface": "warn",
      "sort-properties-angular/sort-object-destructing": "warn",
      "sort-properties-angular/sort-object-expression": [
        "warn",
        { ignoreAngularDecorators: ["Component", "Directive", "Injectable", "NgModule", "Pipe"] },
      ],
      "sort-properties-angular/sort-type-literal": "warn",
    },
  },
];
```

The plugin key is your choice. Registering it as `"sort-properties"` makes it a drop-in replacement for the original plugin with unchanged rule names.

## Options

All four rules share most of the options below:

| Name                       | Description                                                                                                                                                                                                                                                | Type    | Choices                    | Default   |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------------------------- | :-------- |
| `allowLineSeparatedGroups` | If true, properties are separated independently by line breaks. Works same as [eslint sort-keys rule](https://eslint.org/docs/latest/rules/sort-keys#rule-details).                                                                                        | Boolean |                            | `true`    |
| `caseSensitive`            | Whether the comparison is case sensitive.                                                                                                                                                                                                                  | Boolean |                            | `true`    |
| `functionOrder`            | The priority of properties which values are either method or arrow function. For example, if order is 'asc' and functionOrder is 'higher', function properties will be placed at the end. this option is not available for `sort-object-destructing` rule. |         | `higher`, `lower`, `equal` | `higher`  |
| `includeComments`          | Position of comments to consider as part of the property.                                                                                                                                                                                                  |         | `leading`, `trailing`      | `leading` |
| `minKeys`                  | Minimum number of keys to check order.                                                                                                                                                                                                                     | Integer |                            | `2`       |
| `natural`                  | Whether the comparison is using a natural order. See [natural-compare](https://www.npmjs.com/package/natural-compare)                                                                                                                                      | Boolean |                            | `true`    |
| `order`                    | The order of properties.                                                                                                                                                                                                                                   | String  | `asc`, `desc`              | `asc`     |

`sort-object-expression` additionally supports:

| Name                      | Description                                                                                                                                       | Type     | Default                                                       |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ | :------- | :------------------------------------------------------------ |
| `ignoreAngularDecorators` | Angular class decorators whose metadata object is skipped. Objects nested inside the metadata are still checked. `[]` sorts decorator metadata too. | String[] | `["Component", "Directive", "Injectable", "NgModule", "Pipe"]` |

## License

MIT. Based on [eslint-plugin-sort-properties](https://github.com/haenah/eslint-plugin-sort-properties) © haenah, see [LICENSE](LICENSE).
