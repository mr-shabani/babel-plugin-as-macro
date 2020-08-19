var apply_macro = require("../apply_macro");
var fs = require("fs");

test("info that imported as macro", () => {
	var input = `
            import /*as macro*/ info from "./info";
            info.filename;
            info.options.testOption;
        `;

	var expected_output = `"fromString.js";
"this option will be accessible from info tool.";`;

	var output = apply_macro(input, {
		testOption: "this option will be accessible from info tool."
	});
	expect(output).toMatch(expected_output);
});

test("info that imported in another module", () => {
	var input = `
            var /*as macro*/ { info } = require('./test/module_for_test');
            info.filename;
            info.options.testOption;
        `;

	var expected_output = `"fromString.js";
"this option will be accessible from info tool.";`;

	var output = apply_macro(input, {
		testOption: "this option will be accessible from info tool."
	});
	expect(output).toMatch(expected_output);
});

test("info made for transformFileSync", () => {
	var input_file =
		"./test/test_folder/another_folder/jsCodeThatNeedsAsMacroPlugin.js";
	var expected_output = fs.readFileSync(
		"./test/test_folder/another_folder/expected_output.js",
		"utf8"
	);
	var output = apply_macro(input_file, null, true);
	expect(output).toMatch(expected_output);
});
