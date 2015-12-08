// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CodeAdapter from './../adapter';
import ProgressIndicator from './../progressIndicator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export default function list(adapter: CodeAdapter, progressIndicator:ProgressIndicator) {
	var cwd = vscode.workspace.rootPath;
	process.chdir(cwd);
	var bower = require('bower');

	bower.commands
		.list({ xrelative: true, xpaths: true }, { offline: false })
		.on('error', function(installed) {
			adapter.log(installed);
			vscode.window.showErrorMessage('bower install failed! View Output window for further details');
		}).on('end', function(installed) {
			adapter.log(installed);
			adapter.log(installed.dependencies);
		}).on('log', function(message) {
			adapter.log(message);
		})
		.on('prompt', function(prompts, callback) {
			adapter.prompt(prompts, callback);
		});
}
