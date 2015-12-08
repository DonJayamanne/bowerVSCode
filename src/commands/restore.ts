// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as bower from 'bower';
import CodeAdapter from './../adapter';
import ProgressIndicator from './../progressIndicator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export default function restore(adapter: CodeAdapter, progressIndicator:ProgressIndicator) {
	var cwd = vscode.workspace.rootPath;
	process.chdir(cwd);
	progressIndicator.beginTask("bower install");

	bower.commands
		.install()
		.on('error', function(ex) {
			progressIndicator.endTask("bower install");
			console.log(ex);
			vscode.window.showErrorMessage('bower install failed! View Output window for further details');
		}).on('end', function(msg) {
			progressIndicator.endTask("bower install");
			vscode.window.showInformationMessage('bower install completed!');
		}).on('prompt', function(prompts, callback) {
			adapter.prompt(prompts, callback);
		});
}
