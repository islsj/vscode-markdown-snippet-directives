const vscode_0 = require("vscode");
const codelens_0 = require("./codelens/CodeLensController");
const executor_0 = require("./runner/executor");
const { COMMANDS_MAP } = require("./constant");

function activate(context) {
	new codelens_0.CodeLensController(); //	实例化代码片段指令集
	context.subscriptions.push(vscode_0.commands.registerCommand(COMMANDS_MAP.RUN, (lang, directiveName, context, document, snippetRange) => executor_0.runSnippet(lang, directiveName, context, document, snippetRange)));
}
exports.activate = activate;
// 当您的扩展被停用时，会调用此方法
function deactivate() {}
exports.deactivate = deactivate;
