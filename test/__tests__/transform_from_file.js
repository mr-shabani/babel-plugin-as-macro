/* eslint-disable no-undef */
const apply_macro = require("../apply_macro");
const fs = require("fs");

test("transform from file", () => {
	const input_file =
		"./test/test_folder/another_folder/jsCodeThatNeedsAsMacroPlugin.js";
	const expected_output = fs.readFileSync(
		"./test/test_folder/another_folder/expected_output.js",
		"utf8"
	);
	const output = apply_macro(input_file, null, true);
	expect(output).toMatch(expected_output);
});
