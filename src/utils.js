const vscode_0 = require("vscode");

/**
 * 获取工作空间配置
 */
function getPluginConfiguration() {
	return vscode_0.workspace.getConfiguration("markdown-snippet-directives");
}
exports.getPluginConfiguration = getPluginConfiguration;

/**
 * 获取代码片段的语言
 */
function getSnippetLanguages() {
	return Array.from(new Map(getPluginConfiguration().get("languages")).keys());
}
exports.getSnippetLanguages = getSnippetLanguages;
/**
 * 获取代码片段的环境变量
 */
function getSnippetGlobalEnvironmentVariables() {
	return Array.from(new Map(getPluginConfiguration().get("variables")));
}
exports.getSnippetGlobalEnvironmentVariables = getSnippetGlobalEnvironmentVariables;
/**
 * 获取代码片段的语言
 */
function getSnippetConfiguration(lang) {
	const langName = getSnippetLanguages().find((item) => {
		return item.split("|").find((name) => {
			return name === lang;
		});
	});
	return new Map(getPluginConfiguration().get("languages")).get(langName);
}
exports.getSnippetConfiguration = getSnippetConfiguration;

/**
 * 获取语言的指令
 * @param {string} lang
 */
function getSnippetDirectives(lang) {
	return new Map(getSnippetConfiguration(lang).directivesMap);
}
exports.getSnippetDirectives = getSnippetDirectives;

/**
 * 获取语言的扩展名
 * @param {string} lang
 */
function fetchfileExtension(lang) {
	return getSnippetConfiguration(lang).langExt;
}
exports.fetchfileExtension = fetchfileExtension;

/**
 * 双引号包裹文件名
 * @param {string} fileName
 */
function quoteFileName(fileName) {
	return '"' + fileName + '"';
}
exports.quoteFileName = quoteFileName;

/**
 * 生成随机名称
 */
function generateRandomName() {
	const s = Math.random().toString(36) + Math.random().toString(36);
	return s.replace(/[^a-z]+/g, "").substring(0, 10);
}
exports.generateRandomName = generateRandomName;

/**
 * 获取工作空间根
 */
function getWorkspaceRootPath() {
	return vscode_0.workspace.getWorkspaceFolder(vscode_0.window.activeTextEditor.document.uri).uri.fsPath;
}
exports.getWorkspaceRootPath = getWorkspaceRootPath;

/**
 * 获取不带扩展名的文件名。
 * @param {string} fileFullPath
 */
function getFileNamewithoutExt(fileFullPath) {
	const regexMatch = fileFullPath.match(/.*[\/\\](.*(?=\..*))/);
	return regexMatch ? regexMatch[1] : fileFullPath;
}
exports.getFileNamewithoutExt = getFileNamewithoutExt;
/**
 * 获取文件扩展名。
 * @param {string} fileFullPath
 */
function getFileExtName(fileFullPath) {
	const regexMatch = fileFullPath.match(/.*[\/\\].*\.(.*)/);
	return regexMatch ? regexMatch[1] : fileFullPath;
}
exports.getFileExtName = getFileExtName;

/**
 * 获取文件名。
 * @param {string} fileFullPath
 */
function getFileName(fileFullPath) {
	const regexMatch = fileFullPath.match(/.*[\/\\](.*)/);
	return regexMatch ? regexMatch[1] : fileFullPath;
}
exports.getFileName = getFileName;

/**
 * 获取文件的磁盘驱动器号
 * @param { string } fileFullPath
 */
function getDriveLetter(fileFullPath) {
	const regexMatch = fileFullPath.match(/^([A-Za-z]:).*/);
	return regexMatch ? regexMatch[1] : "$driveLetter";
}
exports.getDriveLetter = getDriveLetter;

/**
 * 获取文件夹路径
 * @param { string } fileFullPath
 */
function getDirPath(fileFullPath) {
	const regexMatch = fileFullPath.match(/(.*[\/\\]).*/);
	return regexMatch ? regexMatch[1] : fileFullPath;
}
exports.getDirPath = getDirPath;

/**
 * 获取尾部没有斜杠的文件夹路径
 * @param { string } fileFullPath
 */
function getDirWithoutTrailingSlash(fileFullPath) {
	return getDirPath(fileFullPath).replace(/[\/\\]$/, "");
}
exports.getDirWithoutTrailingSlash = getDirWithoutTrailingSlash;
