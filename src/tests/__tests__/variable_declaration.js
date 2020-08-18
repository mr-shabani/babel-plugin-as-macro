var apply_macro = require("../apply_macro");


test("Simple variable declaration", () => {
	var input = `
	var /*as macro*/ x = 1;
	var y = x;
	`;

	var expected_output = 'var y = 1;';
	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});


test("Variable declaration is not in root", () => {
	var input = `
	var /*as macro*/ x = 1;
	var y = x;
	if(any){
		var /*as macro*/ z = 1;
	}
	`;

	var expected_output = /Macro variable definition only allowed in global scope!/;
	var output = () => apply_macro(input);
	expect(output).toThrowError(expected_output);
});