var babel = require("@babel/core");
var plugin = require("../");

const input = `
var x = 1;
`;

const {code:output} = babel.transform(input, {plugins: [plugin]});

console.log(input);
console.log(' ||   ||   ||   ||   ||');
console.log(' \\/   \\/   \\/   \\/   \\/','\n');
console.log(output);