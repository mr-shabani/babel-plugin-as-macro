var babel = require("@babel/core");
var plugin = require("../");

module.exports = function(
	input_code,
	pluginOptions,
	transform_from_file = false
) {
    pluginOptions = pluginOptions || {};
	if (transform_from_file)
		var { code: newCode } = babel.transformFileSync(input_code, {
			plugins: [[plugin, pluginOptions]]
		});
	else
		var { code: newCode } = babel.transform(input_code, {
			plugins: [[plugin, pluginOptions]]
		});
	return newCode;
};
