/* eslint-disable no-undef */
const apply_macro = require("../apply_macro");


test("No change needs", () => {
	const input = `
	var x = 1;
	`;
	const expected_output = 'var x = 1;';
	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("catch errors", () => {
	const input = `
	var /*as macro*/ f = ()=>{
		throw new Error("Test ERROR!");
	};
	f();
	`;
	const expected_output = /as_macro: Error: Test ERROR!/;
	const output = () => apply_macro(input);
	expect(output).toThrowError(expected_output);
});

