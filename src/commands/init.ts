// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as bower from 'bower';
import CodeAdapter from './../adapter';
import ProgressIndicator from './../progressIndicator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export default function init(adapter: CodeAdapter, progressIndicator: ProgressIndicator) {
	var cwd = vscode.workspace.rootPath;
	process.chdir(cwd);

	bower.commands
		.init({ interactive: true })
		.on('error', function(ex) {
			console.log(ex);
			vscode.window.showErrorMessage('bower init failed! View Output window for further details');
		}).on('end', function(msg) {
			vscode.window.showInformationMessage('bower init completed!');
		}).on('prompt', function(prompts, callback) {
			adapter.prompt(prompts, callback);
		});
}
