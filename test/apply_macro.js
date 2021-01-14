const babel = require("@babel/core");
const plugin = require("../src/");

module.exports = function(
	input_code,
	pluginOptions,
	transform_from_file = false
) {
	pluginOptions = pluginOptions || {};
	let newCode;
	if (transform_from_file)
		newCode = babel.transformFileSync(input_code, {
			plugins: [[plugin, pluginOptions]]
		}).code;
	else
		newCode = babel.transform(input_code, {
			plugins: [[plugin, pluginOptions]]
		}).code;
	return newCode;
};
