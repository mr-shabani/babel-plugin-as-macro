var apply_macro = require("../apply_macro");
var fs = require("fs");

test("transform from file", () => {
	var input_file =
		"./src/tests/test_folder/another_folder/jsCodeThatNeedsAsMacroPlugin.js";
	var expected_output = fs.readFileSync(
		"./src/tests/test_folder/another_folder/expected_output.js",
		"utf8"
	);
	var output = apply_macro(input_file, null, true);
	expect(output).toMatch(expected_output);
});
