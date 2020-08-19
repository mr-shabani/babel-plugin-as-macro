var apply_macro = require("../apply_macro");


test("No change needs", () => {
	var input = `
	var x = 1;
	`;

	var expected_output = 'var x = 1;';
	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("catch errors", () => {
	var input = `
	var /*as macro*/ f = ()=>{
		throw new Error("Test ERROR!");
	};
	f();
	`;

	var expected_output = /as_macro: Error: Test ERROR!/;
	var output = () => apply_macro(input);
	expect(output).toThrowError(expected_output);
});

