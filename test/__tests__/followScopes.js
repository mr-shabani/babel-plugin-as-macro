var apply_macro = require("../apply_macro"); 

test("define macro variable in function", () => {
	var input = `
        var f = function double(input){
            var /*as macro*/ m1 = "this is macro",m2="this is another macro";
            let m3 = 2*m1;
            return m2;
        };
        m2;
	`;

	var expected_output = `var f = function double(input) {
  let m3 = 2 * "this is macro";
  return "this is another macro";
};

m2;`;
    var output = apply_macro(input,{followScopes:true});
	expect(output).toMatch(expected_output);
});

test("define macro variable in two distinct function", () => {
	var input = `
        var f = function double(input){
            var /*as macro*/ m1 = "this is macro",m2="this is another macro";
            let m3 = 2*m1;
            return m2;
        };
        var f2 = function triple(input){
            var /*as macro*/ m5 = 1;
            let m3 = 3*m1;
            return m5;
        };
        m2;
	`;

	var expected_output = `var f = function double(input) {
  let m3 = 2 * "this is macro";
  return "this is another macro";
};

var f2 = function triple(input) {
  let m3 = 3 * m1;
  return 1;
};

m2;`;
    var output = apply_macro(input,{followScopes:true});
	expect(output).toMatch(expected_output);
});

test("macro block in function", () => {
	var input = `
        var f = function double(input){
            {/*as macro*/{
                var m1 = "this is macro";
                var m2="this is another macro";
            }}
            let m3 = 2*m1;
            return m2;
        };
        m2;
	`;

	var expected_output = `var f = function double(input) {
  let m3 = 2 * "this is macro";
  return "this is another macro";
};

m2;`;
    var output = apply_macro(input,{followScopes:true});
	expect(output).toMatch(expected_output);
});