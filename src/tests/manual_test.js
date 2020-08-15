var babel = require("@babel/core");
var plugin = require("../");

const input = `
var bool = true;
if(bool){
	var /*as macro*/ m = "bool is true";
}else{
	var /*as macro*/ m = "bool is false";
}
var string = m;
`;

const {code:output} = babel.transform(input, {plugins:[[plugin,{y:2,followScopes:true}]]});

console.log(input);
console.log(' ||   ||   ||   ||   ||');
console.log(' \\/   \\/   \\/   \\/   \\/','\n');
console.log(output);
