/* eslint-disable no-undef */
const apply_macro = require("../apply_macro");
const fs = require("fs");

test("info that imported as macro", () => {
	const input = `
            import /*as macro*/ info from "./info";
            info.filename;
            info.options.testOption;
        `;

	const expected_output = `"unknown";
"this option will be accessible from info tool.";`;

	const output = apply_macro(input, {
		testOption: "this option will be accessible from info tool."
	});
	expect(output).toMatch(expected_output);
});

test("info that imported in another module", () => {
	const input = `
            var /*as macro*/ { info } = require('./test/module_for_test');
            info.filename;
            info.options.testOption;
        `;

	const expected_output = `"unknown";
"this option will be accessible from info tool.";`;

	const output = apply_macro(input, {
		testOption: "this option will be accessible from info tool."
	});
	expect(output).toMatch(expected_output);
});

test("info made for transformFileSync", () => {
	const input_file =
		"./test/test_folder/another_folder/jsCodeThatNeedsAsMacroPlugin.js";
	const expected_output = fs.readFileSync(
		"./test/test_folder/another_folder/expected_output.js",
		"utf8"
	);
	const output = apply_macro(input_file, null, true);
	expect(output).toMatch(expected_output);
});
