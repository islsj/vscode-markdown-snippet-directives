const vscode_0 = require("vscode");
const codelens_0 = require("./CustomCodeLensProvider");
const { CONFIGURATION_MAP } = require("../constant");

class CodeLensController {
	constructor() {
		//  自定义编码镜头提供程序
		this.internalProvider = new codelens_0.CustomCodeLensProvider();

		//  配置发生变化触发事件
		this.configurationChangeTrigger = vscode_0.workspace.onDidChangeConfiguration((event) => {
			// 刷新配置
			if (event.affectsConfiguration(CONFIGURATION_MAP.LANGUAGES)) {
				this.internalProvider.refresh();
			}
		}, this);

		//  确实更改了文本编辑器选择触发
		this.cursorChangeListener = vscode_0.window.onDidChangeTextEditorSelection(() => {
			//  获取被激活的编辑器
			let editor = vscode_0.window.activeTextEditor;
			//  并且选择是空的
			if (editor && editor.selection.isEmpty) {
				//获取行的位置
				let position = editor.selection.active.line;

				if (position < this.internalProvider.snippetStart || position > this.internalProvider.snippetEnd) {
					this.internalProvider.refresh();
				}
			}
		}, this);

		this.registeredProvider = vscode_0.languages.registerCodeLensProvider({ scheme: "file" }, this.internalProvider);
	}
	//  处理
	dispose() {
		if (this.registeredProvider) this.dispose();
		this.configurationChangeTrigger.dispose();
	}
}
exports.CodeLensController = CodeLensController;
