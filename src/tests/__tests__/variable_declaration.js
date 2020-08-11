var apply_macro = require("../apply_macro");

input = `
var /*as macro*/ x = 1;
var y = x;
`;

expected_output = 'var y = 1;';

test("Simple variable declaration", () => {
	output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

