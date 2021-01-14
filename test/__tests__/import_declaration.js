/* eslint-disable no-undef */
const apply_macro = require("../apply_macro");

test("Simple default import declaration", () => {
	const input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ x from "./test/module_for_test";
            x.number;
            x.string;
        `;
    const expected_output = `import isNotMacro from "isNotMacro";
1;
"string";`;
	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import declaration", () => {
	const input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ {number} from "./test/module_for_test";
            number;
        `;
    const expected_output = `import isNotMacro from "isNotMacro";
1`;
	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import declaration with changing imported variable name", () => {
	const input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ {string as str} from "./test/module_for_test";
            str;
        `;

    const expected_output = `import isNotMacro from "isNotMacro";
"string";`;
	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import default declaration with named import", () => {
	const input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ default_import,{string as str,number as n} from "./test/module_for_test";
            default_import.number;
            str;
            n;
        `;
    const expected_output = `import isNotMacro from "isNotMacro";
1;
"string";
1;`;

	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import from local files and from npm modules", () => {
	const input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ local from "./test/module_for_test";
            local.number;
            import /*as macro*/ fs from 'fs';
        `;

    const expected_output = `import isNotMacro from "isNotMacro";
1;`;

	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import from local ECMAScript files", () => {
	const input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ local,{number as num} from "./test/ECMAScript_module_for_test";
            local.number;
            num;
        `;
    const expected_output = `import isNotMacro from "isNotMacro";
1;
2;`;
	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});
