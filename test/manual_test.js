const babel = require("@babel/core");
const asMacroPlugin = require("../");

const input = `
var /*as macro*/ m1 = "this is a macro",
	m2 = "this is another macro";
var f = function double(m1) {
	let m2 = 2 * m1;
	return m2;
};
`;

const { code: output } = babel.transform(input, {
	plugins: [[asMacroPlugin, { y: 2, testOption: true }]]
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
