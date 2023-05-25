# Markdown Snippet Directives - Visual Studio Code Extension

### Features:

en:You can customize directives for the Markdown snippet, click on the bottom button of the snippet to execute the directive.
<br/>
zh:您可以自定义 Markdown 代码段中的指令，然后单击代码片段的底部按钮来执行指令。

[![preview.gif](https://i.postimg.cc/hvsthLkt/preview.gif)](https://postimg.cc/5QHVRC9h)

### Variable:

en:Variables will replace the contents of directive.
<br/>
zh:变量会替换指令里的内容。

#### Default variable

| Default variable               | describe                                                                        |
| :----------------------------- | :------------------------------------------------------------------------------ |
| $$filName                      | en:Full file name<br/>zh:有后缀的完整文件名                                     |
| $$rootPathWithoutTrailingSlash | en:Workspace root path without trailing slash<br/>zh:不带尾斜杠的工作空间根路径 |

### Configuration:

#### markdown-snippet-directives.variables

Global variable:

en:Add an entry in auto rename tag activationOnLanguage to set global variables.
<br/>
zh:在 markdown-snippet-directives.variables 中添加条目，以设置全局变量。

```json
"markdown-snippet-directives.variables": [
	["$$directive", "node"]
]
```

#### markdown-snippet-directives.languages

en:Configuring snippet Instructions in Markdown.You can click Execute in the snippet.
<br/>
zh:配置在 Markdown 代码片段里的指令,可以在代码片段中点击执行.

```json
"markdown-snippet-directives.languages": [
	[
		"javascript|js",
		{
			"langExt": ".js",
			"directivesMap": [
				["run", "node $$rootPathWithoutTrailingSlash/$$fileName"]
			]
		}
	]
]
```

### Local variable

en:Local variables have higher priority than global and default variables.
<br/>
zh:局部变量的优先级高于全局变量和默认变量。

Define Rules:

```txt
//== $$myVariableName=myVariableValue ==//
```

Example:

```js
//== $$rootPathWithoutTrailingSlash=. ==//
//== $$fileName=1.js ==//
console.log("Hello World!");
```

[![define-local-variables.gif](https://i.postimg.cc/G27cCLG4/define-local-variables.gif)](https://postimg.cc/LYPdkMyS)
