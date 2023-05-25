const fs_0 = require("fs");
const os_0 = require("os");
const path_0 = require("path");
const vscode_0 = require("vscode");
const utils_0 = require("../utils");
const CONSTANT = require("../constant");

class CodeManager {
	constructor() {
		this._TERMINAL_DEFAULT_SHELL_WINDOWS = null;
		this._outputChannel = vscode_0.window.createOutputChannel("Code");
		this._process = null;
		this._FileFullPath = "";
		this._isTmpFile = true;
		this._languageId = "";
		this._snippetRange = null;
		this._completeDocument = {};
		this._cwd = os_0.tmpdir();
		this._config = utils_0.getPluginConfiguration();
		this.environmentVariable = new Map();
	}
	//	执行任务
	run(languageId = "", directiveName = "", context = "", document = {}, snippetRange) {
		this._languageId = languageId;
		this._snippetRange = snippetRange;
		this._completeDocument = document;
		const executor = utils_0.getSnippetDirectives(languageId).get(directiveName);
		const fileExtension = utils_0.fetchfileExtension(languageId);

		if (executor === "" || fileExtension === "") {
			return vscode_0.window.showInformationMessage("不支持或未定义代码语言。");
		}

		this.getCodeFileAndExecute(fileExtension, executor, context);
	}
	//	终止任务
	dispose() {
		if (this._terminal) {
			this._terminal.sendText("; exit");
			this._terminal.dispose();
			this._terminal = null;
		}
	}
	//	获取代码文件并执行
	getCodeFileAndExecute(fileExtension, executor, context) {
		this._isTmpFile = true;
		//	解析当前代码片段的变量
		this.analysisSnippetEnvironmentVariable(fileExtension);
		//  创建临时文件
		this.createRandomFile(context, this.environmentVariable.get("$$rootPathWithoutTrailingSlash"), this.environmentVariable.get("$$fileName"));
		//  执行命令
		this.executeCommandInTerminal(executor);
	}

	getLocalVariables() {
		const lineCountStartRegExp = `.*\\/\\/\\=\\=`;
		const lineCountEndRegExp = `\\=\\=\\/\\/.*`;
		const contentRegExp = `(.*)`;
		let localEnvironmentVariables = new Map();
		for (let i = this._snippetRange.start.line; i < this._snippetRange.end.line; i++) {
			const lineContent = this._completeDocument.lineAt(i).text;
			const expression = lineContent.match(new RegExp(lineCountStartRegExp + contentRegExp + lineCountEndRegExp));
			if (expression) {
				const [variableName, variableValue] = expression[1].split("=").map((token) => token.trim());
				localEnvironmentVariables.set(variableName, variableValue);
			}
		}
		return localEnvironmentVariables;
	}
	//	解析当前代码片段的变量
	analysisSnippetEnvironmentVariable(fileExtension) {
		//	变量默认值
		//  文件扩展名
		const fileType = fileExtension ? fileExtension : "." + this._languageId;
		const fileNameWithoutExt = utils_0.generateRandomName();
		const fileName = fileNameWithoutExt + fileType;

		const defaultValue = new Map([
			// 文件名
			["$$fileName", fileName],
			// 工作空间跟路径
			["$$rootPathWithoutTrailingSlash", this._cwd + "/" + CONSTANT.TEMPORARY_FOLDER_NAME],
			// 不带扩展名的文件名
			// 文件完整路径
			// 磁盘驱动器号（仅限Windows）
			// 不带尾部斜杠的代码文件夹路径
		]);
		//	全局变量替换默认值
		const globalVariable = utils_0.getSnippetGlobalEnvironmentVariables();
		globalVariable.forEach(([variableName, variablValue]) => {
			defaultValue.set(variableName, variablValue);
		});
		//	局部变量替换全局变量
		const localVariable = this.getLocalVariables();
		[...localVariable].forEach(([variableName, variablValue]) => {
			defaultValue.set(variableName, variablValue);
		});
		this.environmentVariable = defaultValue;
	}
	/**
	 * 创建文件夹
	 * @param {string} filePath    //  文件路径
	 */
	createDirectory(filePath) {
		const directoryPath = path_0.dirname(filePath);
		if (!fs_0.existsSync(directoryPath)) {
			fs_0.mkdirSync(directoryPath, { recursive: true });
		}
	}
	/**
	 * 创建文件
	 * @param {string} content  //  文件内容
	 * @param {string} dirWithoutTrailingSlash   //  文件夹路径
	 * @param {string} fileName    //  带扩展名的文件名
	 */
	createRandomFile(content, dirWithoutTrailingSlash, fileName) {
		let root = utils_0.getWorkspaceRootPath() + "/";
		if (dirWithoutTrailingSlash[0] !== ".") root = "";
		// TODO:删除零时文件夹
		const end = "/";
		//  完整临时文件路径
		this._FileFullPath = path_0.join(root + dirWithoutTrailingSlash + end, fileName);
		//	创建文件夹
		this.createDirectory(this._FileFullPath);
		//  写入文件
		fs_0.writeFileSync(this._FileFullPath, content);
	}

	/**
	 *	执行器中的变量
	 * @param executor 用于运行源代码文件的命令
	 * @return 运行文件的完整命令，其中包括文件名
	 */
	getFinalCommandToRunCodeFile(executor) {
		let cmd = executor;
		//  变量替换
		[...this.environmentVariable].forEach(([variableName, variablValue]) => {
			//	变量名需要用$$开头
			if (variableName[0] === "$" && variableName[1] === "$") {
				const $_0 = `\\` + variableName[0];
				const $_1 = `\\` + variableName[1];
				const rest = variableName.slice(2);
				cmd = cmd.replace(new RegExp($_0 + $_1 + rest, "g"), variablValue);
			}
		});
		return cmd !== executor ? cmd : executor + ` ${utils_0.quoteFileName(this._FileFullPath)}`;
	}

	changeFilePathForBashOnWindows(command) {
		const replacer = (match, p1) => `/mnt/${p1.toLowerCase()}/`;
		if (os_0.platform() === "win32") {
			const windowsShell = vscode_0.workspace.getConfiguration("terminal").get("integrated.shell.windows");
			const terminalRoot = this._config.get("terminalRoot");
			if (windowsShell && terminalRoot) {
				command = command.replace(/([A-Za-z]):\\/g, (match, p1) => `${terminalRoot}${p1.toLowerCase()}/`).replace(/\\/g, "/");
			} else if (windowsShell && windowsShell.toLowerCase().indexOf("bash") > -1 && windowsShell.toLowerCase().indexOf("windows") > -1) {
				command = command.replace(/([A-Za-z]):\\/g, replacer).replace(/\\/g, "/");
			}
		}
		return command;
	}

	//  创建终端
	async executeCommandInTerminal(executor) {
		//  终端已存在
		this.dispose();
		this._terminal = vscode_0.window.createTerminal("Code");
		//  显示终端
		this._terminal.show();

		//  获取运行代码的指令
		let command = this.getFinalCommandToRunCodeFile(executor);

		//  更改Windows上Bash的文件路径
		command = this.changeFilePathForBashOnWindows(command);
		//  如果终端存在则清空内容
		vscode_0.commands.executeCommand("workbench.action.terminal.clear");
		//  发送指令
		this._terminal.sendText(command);
	}
}
exports.CodeManager = CodeManager;
