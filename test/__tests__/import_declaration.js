var apply_macro = require("../apply_macro");

test("Simple default import declaration", () => {
	var input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ x from "./test/module_for_test";
            x.number;
            x.string;
        `;

    var expected_output = `import isNotMacro from "isNotMacro";
1;
"string";`;

	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import declaration", () => {
	var input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ {number} from "./test/module_for_test";
            number;
        `;

    var expected_output = `import isNotMacro from "isNotMacro";
1`;

	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import declaration with changing imported variable name", () => {
	var input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ {string as str} from "./test/module_for_test";
            str;
        `;

    var expected_output = `import isNotMacro from "isNotMacro";
"string";`;

	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import default declaration with named import", () => {
	var input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ default_import,{string as str,number as n} from "./test/module_for_test";
            default_import.number;
            str;
            n;
        `;

    var expected_output = `import isNotMacro from "isNotMacro";
1;
"string";
1;`;

	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import from local files and from npm modules", () => {
	var input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ local from "./test/module_for_test";
            local.number;
            import /*as macro*/ fs from 'fs';
        `;

    var expected_output = `import isNotMacro from "isNotMacro";
1;`;

	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("import from local ECMAScript files", () => {
	var input = `
            import isNotMacro from "isNotMacro";
            import /*as macro*/ local,{number as num} from "./test/ECMAScript_module_for_test";
            local.number;
            num;
        `;

    var expected_output = `import isNotMacro from "isNotMacro";
1;
2;`;

	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});
