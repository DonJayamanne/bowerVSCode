// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CodeAdapter from './../adapter';
import ProgressIndicator from './../progressIndicator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function install(adapter: CodeAdapter, name:string, config:any, progressIndicator:ProgressIndicator) {
	var cwd = vscode.workspace.rootPath;
	process.chdir(cwd);
	var bower = require('bower');
	progressIndicator.beginTask("bower install");

	bower.commands
		.install([name], config)
		.on('error', function(ex) {
			progressIndicator.endTask("bower install");
			adapter.log(ex);
			vscode.window.showErrorMessage('bower install failed! View Output window for further details');
		}).on('end', function() {
			progressIndicator.endTask("bower install");
			vscode.window.showInformationMessage("bower package '" + name + "' successfully installed!");
		}).on('prompt', function(prompts, callback) {
			adapter.prompt(prompts, callback);
		});
}
