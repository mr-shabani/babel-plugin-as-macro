// This file is a ECMAScript that uses babel-plugin-as-macro.
import some from "any module";
import /*as macro*/ path from "path";
import /*as macro*/ importedTestModule from "./src/tests/module_for_test";
importedTestModule.number;
importedTestModule.string;
importedTestModule.info.filename;
var /*as macro*/ requiredTestModule = require('../../module_for_test');
requiredTestModule.number;
requiredTestModule.string;
requiredTestModule.info.filename;
