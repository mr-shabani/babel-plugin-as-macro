var babel = require("@babel/core");
var plugin = require("../");

const input = `
{/*as macro*/{
	var obj = {};
	obj.obj = obj;
}}
obj;
`;

const { code: output } = babel.transform(input, {
	plugins: [[plugin, { y: 2, testOption: true }]]
});
// const {
// 	code: output
// } = babel.transformFileSync(
// 	"./src/tests/test_folder/another_folder/jsCodeThatNeedsAsMacroPlugin.js",
// 	{ plugins: [[plugin, { y: 2 }]] }
// );

console.log(input);
console.log(" ||   ||   ||   ||   ||");
console.log(" \\/   \\/   \\/   \\/   \\/", "\n");
console.log(output);
