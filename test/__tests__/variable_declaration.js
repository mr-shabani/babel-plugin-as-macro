/* eslint-disable no-undef */
const apply_macro = require("../apply_macro");


test("Simple variable declaration", () => {
	const input = `
	var /*as macro*/ x = 1;
	var y = x;
	`;
	const expected_output = 'var y = 1;';
	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});


test("Variable declaration is not in root", () => {
	const input = `
	var /*as macro*/ x = 1;
	var y = x;
	if(any){
		var /*as macro*/ z = 1;
	}
	`;
	const expected_output = /Macro variable definition only allowed in global scope!/;
	const output = () => apply_macro(input);
	expect(output).toThrowError(expected_output);
});