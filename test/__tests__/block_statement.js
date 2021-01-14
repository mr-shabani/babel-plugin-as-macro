/* eslint-disable no-undef */
const apply_macro = require("../apply_macro");

test("Simple macro block statement", () => {
    const input = `
        // comment 
        any.expression;
        {
            /*as macro*/
            {
                var m1 = "this is macro";
            }
        }
        m1;
        `;

    const expected_output = `// comment 
any.expression;
"this is macro";`;
	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("macro block statement that is not in root program", () => {
    const input = `
        // comment 
        if(any) {
            /*as macro*/
            {
                var m1 = "this is macro";
            }
        }
        `;
    const expected_output = /Macro block only allowed in global scope!/;
	const output = () => apply_macro(input);
	expect(output).toThrowError(expected_output);
});

test("macro block statement that has more than one block", () => {
    const input = `
        // comment 
        {
            /*as macro*/
            {
                var m1 = "this is macro";
            }
            any.expression;
        }
        `;

    const expected_output = `// comment 
{
  /*as macro*/
  {
    var m1 = "this is macro";
  }
  any.expression;
}`;

	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("macro block statement that has not block child", () => {
    const input = `
        // comment 
        {
            /*as macro*/
            var m1 = "this is macro";
        }
        `;

    const expected_output = `// comment 
{
  /*as macro*/
  var m1 = "this is macro";
}`;

	const output = apply_macro(input);
	expect(output).toMatch(expected_output);
});