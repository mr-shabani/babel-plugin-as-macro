var apply_macro = require("../apply_macro");

test("Simple macro block statement", () => {
    var input = `
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

    var expected_output = `// comment 
any.expression;
"this is macro";`;

	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("macro block statement that is not in root program", () => {
    var input = `
        // comment 
        if(any) {
            /*as macro*/
            {
                var m1 = "this is macro";
            }
        }
        `;

//     var expected_output = `// comment 
// if (any) {
//   /*as macro*/
//   {
//     var m1 = "this is macro";
//   }
// }`;

    var expected_output = /Macro block only allowed in global scope!/;
	var output = () => apply_macro(input);
	expect(output).toThrowError(expected_output);
});

test("macro block statement that has more than one block", () => {
    var input = `
        // comment 
        {
            /*as macro*/
            {
                var m1 = "this is macro";
            }
            any.expression;
        }
        `;

    var expected_output = `// comment 
{
  /*as macro*/
  {
    var m1 = "this is macro";
  }
  any.expression;
}`;

	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});

test("macro block statement that has not block child", () => {
    var input = `
        // comment 
        {
            /*as macro*/
            var m1 = "this is macro";
        }
        `;

    var expected_output = `// comment 
{
  /*as macro*/
  var m1 = "this is macro";
}`;

	var output = apply_macro(input);
	expect(output).toMatch(expected_output);
});