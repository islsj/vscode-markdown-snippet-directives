const vscode_0 = require("vscode");
const utils_0 = require("../utils");
const { COMMANDS_MAP } = require("../constant");

//  自定义编码镜头提供程序
class CustomCodeLensProvider {
	constructor() {
		this.onDidChangeCodeLensesEmitter = new vscode_0.EventEmitter();
		this.snippetStart = -1;
		this.snippetEnd = -1;
	}
	get onDidChangeCodeLenses() {
		return this.onDidChangeCodeLensesEmitter.event;
	}
	//  恢复
	refresh() {
		this.onDidChangeCodeLensesEmitter.fire();
		this.snippetStart = -1;
		this.snippetEnd = -1;
	}
	//  提供编码镜头
	provideCodeLenses(document) {
		// 验证文件类型markdown
		if (document.languageId !== "markdown") return;

		//	光标所在行
		const activeTextEditor = vscode_0.window.activeTextEditor;
		let cursorLine = -1;
		if (activeTextEditor && activeTextEditor.selection.isEmpty && activeTextEditor.selection.active.line > 0) {
			cursorLine = activeTextEditor.selection.active.line;
		} else {
			return undefined;
		}

		//	开始和结束
		const snippetStartRegExp = "```(" + utils_0.getSnippetLanguages().join("|") + ")$";
		const snippetEndRegExp = "```$";

		//刷新
		this.snippetStart = -1;
		this.snippetEnd = -1;
		for (let i = cursorLine; i >= 0; i--) {
			const lineContent = document.lineAt(i).text;
			if (lineContent.match(new RegExp(snippetEndRegExp))) {
				return undefined;
			}
			if (lineContent.match(new RegExp(snippetStartRegExp))) {
				this.snippetStart = i;
				break;
			}
		}
		for (let i = cursorLine; i < document.lineCount; i++) {
			const lineContent = document.lineAt(i).text;
			if (lineContent.match(new RegExp(snippetStartRegExp))) {
				return undefined;
			}
			if (lineContent.match(new RegExp(snippetEndRegExp))) {
				this.snippetEnd = i;
				break;
			}
		}

		//	光标不在代码段内
		if (this.snippetStart === -1 || this.snippetEnd === -1) return undefined;

		//获取 语言名称,指令行,代码段范围
		const lang = document.lineAt(this.snippetStart).text.replace("```", "").trim();
		const codeLensLine = new vscode_0.Range(this.snippetEnd, 0, this.snippetEnd, 0);
		const snippetRange = new vscode_0.Range(this.snippetStart + 1, 0, this.snippetEnd, 0);
		//	获取 光标所在位置的代码块所对应指令名字的集合
		const allDirectiveName = Array.from(utils_0.getSnippetDirectives(lang).keys());
		if (!allDirectiveName.length) return;

		//	添加把配置的指令添加到对应的指令行
		const codeLens = [];
		for (const directiveName of allDirectiveName) {
			codeLens.push(
				new vscode_0.CodeLens(codeLensLine, {
					title: directiveName,
					command: COMMANDS_MAP.RUN,
					arguments: [lang, directiveName, document.getText(snippetRange), document, snippetRange],
				})
			);
		}
		return codeLens;
	}
}
exports.CustomCodeLensProvider = CustomCodeLensProvider;
