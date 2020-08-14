var babel = require("@babel/core");
var plugin = require("../");

const input = `
// comment 
any.expression;
var /*as macro*/ m =() => {
    throw new Error("test error")
};
{
    /*as macro*/
    {
        var m1 = "this is macro";
        var m2 = process.cwd();
        var m3 = {x:"string"};
    }
}
m2;
m();
var x = m3;
`;

const {code:output} = babel.transform(input, {plugins: [plugin]});

console.log(input);
console.log(' ||   ||   ||   ||   ||');
console.log(' \\/   \\/   \\/   \\/   \\/','\n');
console.log(output);
