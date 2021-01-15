const babel = require("@babel/core");
const asMacroPlugin = require("./");
let input, output;

const withColor = '\x1b[30;42m%s\x1b[0m'; 

// Example 1 :
console.log(withColor,"Example 1: ");
input = `
var /*as macro*/ m = { x: 1 };
{
	/*as macro*/ {
		m.str = "some string";
	}
}
let obj = m
`;

output = babel.transform(input, {
	plugins: [asMacroPlugin]
}).code;
console.log(input);
console.log(" ||   ||   ||   ||   ||");
console.log(" \\/   \\/   \\/   \\/   \\/", "\n");
console.log(output);

// Example 2 :
console.log(withColor,"Example 2: ");
input = `
{
	/*as macro*/ {
		var macroFunction = function computeAtCompileTime() {
			return "Result";
		};
	}
}
console.log(macroFunction());
let obj = macroFunction
`;

output = babel.transform(input, {
	plugins: [asMacroPlugin]
}).code;
console.log(input);
console.log(" ||   ||   ||   ||   ||");
console.log(" \\/   \\/   \\/   \\/   \\/", "\n");
console.log(output);

// Example 3 :
console.log(withColor,"Example 3: ");
input = `
var /*as macro*/ m1 = "this is a macro",
	m2 = "this is another macro";
var f = function double(m1) {
	let m2 = 2 * m1;
	return m2;
};
`;

output = babel.transform(input, {
	plugins: [asMacroPlugin]
}).code;
console.log(input);
console.log(" ||   ||   ||   ||   ||");
console.log(" \\/   \\/   \\/   \\/   \\/", "\n");
console.log(output);

// Example 4 :
console.log(withColor,"Example followScope: ");
input = `
var /*as macro*/ m1 = "this is a macro",
	m2 = "this is another macro";
var f = function double(m1) {
	{
		/*as macro*/ {
			var localMacro = "this is local";
		}
	}
	let m2 = 2 * m1;
	var str = localMacro;
	return m2;
};
var globalString = localMacro;
`;

output = babel.transform(input, {
	plugins: [[asMacroPlugin,{followScopes:true}]]
}).code;
console.log(input);
console.log(" ||   ||   ||   ||   ||");
console.log(" \\/   \\/   \\/   \\/   \\/", "\n");
console.log(output);

// Example 5 :
console.log(withColor,"Example followScope: ");
input = `
var /*as macro*/ m1 = "this is a macro",
	m2 = "this is another macro";
var f = function double(m1) {
	{
		/*as macro*/ {
			var localMacro = "this is local";
		}
	}
	let m2 = 2 * m1;
	var str = localMacro;
	return m2;
};
var globalString = localMacro;
`;

output = babel.transform(input, {
	plugins: [[asMacroPlugin,{followScopes:true}]]
}).code;
console.log(input);
console.log(" ||   ||   ||   ||   ||");
console.log(" \\/   \\/   \\/   \\/   \\/", "\n");
console.log(output);
