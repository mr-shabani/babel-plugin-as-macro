var babel = require("@babel/core");
var plugin = require("../");

const input = `
// comment 
any.expression;
const /*as macro*/ m =1;
{
    /*as macro*/
    {
        var m1 = "this is macro";
        var m2 = process.cwd();
    }
}
m2;
`;

const {code:output} = babel.transform(input, {plugins: [plugin]});

console.log(input);
console.log(' ||   ||   ||   ||   ||');
console.log(' \\/   \\/   \\/   \\/   \\/','\n');
console.log(output);