const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { Linter, RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");
const angularPlugin = require("@angular-eslint/eslint-plugin");
const plugin = require("..");

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: { parser: tsParser },
});
const rule = plugin.rules["sort-object-expression"];
const outOfOrder = (name) => ({ data: { name }, messageId: "outOfOrder" });

ruleTester.run("sort-object-expression (angular)", rule, {
  invalid: [
    {
      code: `
@Component({
  selector: 'x',
  host: { role: 'button', class: 'x' },
})
class A {}`,
      errors: [outOfOrder("class")],
      name: "nested host object inside @Component is still sorted",
      output: `
@Component({
  selector: 'x',
  host: { class: 'x', role: 'button' },
})
class A {}`,
    },
    {
      code: `
@NgModule({
  providers: [{ useClass: B, provide: A }],
})
class M {}`,
      errors: [outOfOrder("provide")],
      name: "provider objects inside @NgModule are still sorted",
      output: `
@NgModule({
  providers: [{ provide: A, useClass: B }],
})
class M {}`,
    },
    {
      code: `
class A {
  @Input({ transform: t, alias: 'a' }) x;
}`,
      errors: [outOfOrder("alias")],
      name: "non-type decorators (e.g. @Input) are still sorted",
      output: `
class A {
  @Input({ alias: 'a', transform: t }) x;
}`,
    },
    {
      code: `@Foo({ b: 1, a: 2 }) class A {}`,
      errors: [outOfOrder("a")],
      name: "unknown class decorators are still sorted",
      output: `@Foo({ a: 2, b: 1 }) class A {}`,
    },
    {
      code: `Component({ selector: 'x', imports: [] });`,
      errors: [outOfOrder("imports")],
      name: "plain calls (not decorators) are still sorted",
      output: `Component({ imports: [], selector: 'x' });`,
    },
    {
      code: `const A = @Component({ selector: 'x', imports: [] }) class {};`,
      errors: [outOfOrder("imports")],
      name: "class expressions are still sorted (the Angular rule ignores them)",
      output: `const A = @Component({ imports: [], selector: 'x' }) class {};`,
    },
    {
      code: `@Component({ selector: 'x', imports: [] }) class A {}`,
      errors: [outOfOrder("imports")],
      name: "ignoreAngularDecorators: false sorts decorator metadata too",
      options: [{ ignoreAngularDecorators: false }],
      output: `@Component({ imports: [], selector: 'x' }) class A {}`,
    },
    {
      code: `@Directive({ selector: 'x', host: {} }) class A {}`,
      errors: [outOfOrder("host")],
      name: "ignoreAngularDecorators: false sorts @Directive metadata too",
      options: [{ ignoreAngularDecorators: false }],
      output: `@Directive({ host: {}, selector: 'x' }) class A {}`,
    },
  ],
  valid: [
    {
      code: `
@Component({
  selector: 'x',
  imports: [],
  templateUrl: './x.html',
  changeDetection: 0,
  host: { class: 'x', role: 'button' },
})
export class A {}`,
      name: "@Component metadata in Angular order",
    },
    {
      code: `@Directive({ selector: 'x', providers: [], host: {} }) class A {}`,
      name: "@Directive metadata in Angular order",
    },
    {
      code: `@Injectable({ providedIn: 'root', useClass: B, deps: [] }) class A {}`,
      name: "@Injectable metadata in Angular order",
    },
    {
      code: `@NgModule({ imports: [], declarations: [], exports: [] }) class M {}`,
      name: "@NgModule metadata in Angular order",
    },
    {
      code: `@Pipe({ name: 'x', standalone: true, pure: false }) class P {}`,
      name: "@Pipe metadata in Angular order",
    },
    {
      code: `export default @Component({ selector: 'x', imports: [] }) class A {}`,
      name: "export default class declaration",
    },
    {
      code: `@Directive({ selector: 'x', host: {} }) class A {}`,
      name: "ignoreAngularDecorators: true (explicit)",
      options: [{ ignoreAngularDecorators: true }],
    },
  ],
});

describe("integration with @angular-eslint/sort-keys-in-type-decorator", () => {
  const linter = new Linter({ configType: "flat" });
  const config = [
    {
      files: ["**/*.ts"],
      languageOptions: { parser: tsParser },
      plugins: { "@angular-eslint": angularPlugin, "sort-properties": plugin },
      rules: {
        "@angular-eslint/sort-keys-in-type-decorator": "error",
        "sort-properties/sort-object-expression": "error",
      },
    },
  ];

  it("both rules converge under --fix without conflicting", () => {
    const code = `
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'button', class: 'x' },
  imports: [Foo],
  selector: 'app-x',
  templateUrl: './x.html',
})
export class X {}
`;
    const result = linter.verifyAndFix(code, config, "x.ts");
    assert.deepEqual(result.messages, []);
    assert.equal(
      result.output,
      `
@Component({
  selector: 'app-x',
  imports: [Foo],
  templateUrl: './x.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'x', role: 'button' }
})
export class X {}
`
    );
  });

  it("Angular-ordered metadata is accepted by both rules", () => {
    const code = `
@Component({
  selector: 'app-x',
  imports: [Foo],
  templateUrl: './x.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class X {}
`;
    assert.deepEqual(linter.verify(code, config, "x.ts"), []);
  });
});
