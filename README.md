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

Skipping is controlled by the boolean `ignoreAngularDecorators` option of [`sort-object-expression`](docs/rules/sort-object-expression.md) (default `true`). Set it to `false` if you do not use `sort-keys-in-type-decorator` and want decorator metadata sorted alphabetically too.

## Other changes compared to the original

- Rules no longer mutate AST nodes (the original widened `range`/`loc` of property nodes to include comments and stored cache fields on them). This could leak into other rules' fixers and is rejected by ESLint 10's `RuleTester`.
- Fixed an invalid JSON schema (`required: false` on `includeComments`).
- Added a test suite (`pnpm test`).
- Supports ESLint 9.22+ and 10 (flat config).

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
npm install --save-dev eslint eslint-plugin-sort-properties-angular
# or
pnpm add -D eslint eslint-plugin-sort-properties-angular
```

Requires ESLint 9.22 or newer (including 10) with flat config (`eslint.config.js` / `eslint.config.mjs`). The legacy `.eslintrc` format is not supported.

## Available configurations

<!-- begin auto-generated configs list -->

|                                                                          | Name  | Description                                                         |
| :----------------------------------------------------------------------- | :---- | :------------------------------------------------------------------ |
| 🌐                                                                       | `all` | Enable all rules of the `sort-properties-angular` plugin.           |
| ![JavaScript](https://img.shields.io/badge/-JS-F7DF1E?style=flat-square) | `js`  | Enable the JavaScript rules (object expressions and destructuring). |
| ![TypeScript](https://img.shields.io/badge/-TS-007ACC?style=flat-square) | `ts`  | Enable the TypeScript rules (interfaces and type literals).         |

<!-- end auto-generated configs list -->

## Configuration

> **Note**\
> Decorators and the TypeScript rules (`sort-interface`, `sort-type-literal`) need the TypeScript parser. In an Angular project it is already set up by [`typescript-eslint`](https://typescript-eslint.io) / [`angular-eslint`](https://github.com/angular-eslint/angular-eslint).

### Angular project (recommended)

Enable the plugin's `all` config together with `@angular-eslint/sort-keys-in-type-decorator`:

```js
// eslint.config.mjs
import angular from "angular-eslint";
import { defineConfig } from "eslint/config";
import sortProperties from "eslint-plugin-sort-properties-angular";
import tseslint from "typescript-eslint";

export default defineConfig({
  files: ["**/*.ts"],
  extends: [tseslint.configs.recommended, angular.configs.tsRecommended, sortProperties.configs.all],
  rules: {
    "@angular-eslint/sort-keys-in-type-decorator": "error",
  },
});
```

### Enable rules individually

```js
// eslint.config.mjs
import { defineConfig } from "eslint/config";
import sortProperties from "eslint-plugin-sort-properties-angular";
import tseslint from "typescript-eslint";

export default defineConfig({
  files: ["**/*.ts"],
  languageOptions: { parser: tseslint.parser },
  plugins: { "sort-properties-angular": sortProperties },
  rules: {
    "sort-properties-angular/sort-interface": "error",
    "sort-properties-angular/sort-object-destructing": "error",
    "sort-properties-angular/sort-object-expression": [
      "error",
      {
        // Default. Use false to sort Angular decorator metadata alphabetically as well.
        ignoreAngularDecorators: true,
      },
    ],
    "sort-properties-angular/sort-type-literal": "error",
  },
});
```

### Migrating from `eslint-plugin-sort-properties`

The plugin key is your choice. Register the fork under the old `sort-properties` key and your existing rule names keep working unchanged:

```diff
-import sortProperties from "eslint-plugin-sort-properties";
+import sortProperties from "eslint-plugin-sort-properties-angular";

 export default defineConfig({
   plugins: { "sort-properties": sortProperties },
   rules: {
     "sort-properties/sort-object-expression": "error",
     // ...
   },
 });
```

> **Note**\
> Register the plugin under one key only. Do not combine this with `sortProperties.configs.all` / `js` / `ts`: those register the plugin under `sort-properties-angular` as well, so every rule would run twice (once per key) and report each problem twice. Either keep the old key and enable rules individually as above, or switch to the configs and rename your rule settings to `sort-properties-angular/*`.

`configs.all`, `configs.js` and `configs.ts` are flat configs. `configs["flat/all"]`, `configs["flat/js"]` and `configs["flat/ts"]` remain as aliases.

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
| `ignoreAngularDecorators` | Skip the metadata object of `@Component`, `@Directive`, `@Injectable`, `@NgModule` and `@Pipe`. Objects nested inside the metadata are still checked. `false` sorts decorator metadata too. | Boolean | `true` |

## License

MIT. Based on [eslint-plugin-sort-properties](https://github.com/haenah/eslint-plugin-sort-properties) © haenah, see [LICENSE](LICENSE).
