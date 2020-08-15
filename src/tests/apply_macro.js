var babel = require("@babel/core");
var plugin = require("../");

module.exports = function(input_code,pluginOptions={}){
    const {code:newCode} = babel.transform(input_code, {plugins: [[plugin,pluginOptions]]});
    return newCode;
}
