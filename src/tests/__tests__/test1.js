var apply_macro = require("../apply_macro");

input = `
 var x = 1;
`;

expected_output = 'var x = 1;';


test("No change needed", () => {
	output = apply_macro(input);
	expect(output).toMatch(expected_output);
});


