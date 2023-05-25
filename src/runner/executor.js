const codeManager_0 = require("./codeManager");

const manager = new codeManager_0.CodeManager();
function runSnippet(lang, directiveName, context, document, snippetRange) {
	if (lang !== "" && directiveName !== "" && context !== "" && Object.keys(document).length) {
		manager.run(lang, directiveName, context, document, snippetRange);
	}
}
exports.runSnippet = runSnippet;
