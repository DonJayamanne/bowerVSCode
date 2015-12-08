// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CodeAdapter from './../adapter';
import ProgressIndicator from './../progressIndicator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function search(adapter: CodeAdapter, progressIndicator: ProgressIndicator) {
	var cwd = vscode.workspace.rootPath;
	process.chdir(cwd);
	var bower = require('bower');

	search();

	function search() {
		vscode.window.showInputBox({ placeHolder: "Enter package name to search (bower search <name>)" }).then(function(searchString) {
			if (typeof (searchString) !== "string" || searchString.length === 0) {
				return;
			}
			progressIndicator.beginTask("bower search");

			bower.commands
				.search(searchString)
				.on('error', function(installed) {
					progressIndicator.endTask("bower search");
					console.log(installed);
					vscode.window.showErrorMessage('bower search failed! View Output window for further details');
				}).on('end', function(results) {
					progressIndicator.endTask("bower search");
					var packages = results.map(item=> { return { label: item.name, description: item.url, name: item.name } });
					displayPackageList(packages);
				});
		});
	}

	function displayPackageList(packages: vscode.QuickPickItem[]) {
		vscode.window.showQuickPick(packages, { placeHolder: "Select the package to install" }).then(function(item) {
			if (!item) {
				return;
			}
			displayPackageForInstallation(item);
		});
	}
	const SAVE_NO_UPDATE = "Install";
	const SAVE = "Install as Dependency";
	const SAVE_DEV = "Install as Dev Dependency";
	const SAVE_DEV_BOTH = "Install as Dependency and Dev Dependency";
	function displayPackageForInstallation(pkg: any) {
		var actions = [
			{ label: SAVE_NO_UPDATE, description: "bower install <name>" },
			{ label: SAVE, description: "Install into bower.json dependencies (bower install <name> --save)" }
			// { label: SAVE_DEV, description: "Install into bower.json devDependencies (bower install <name> --save-dev)" }
		];
		vscode.window.showQuickPick(actions, { placeHolder: "Install " + pkg.label }).then(function(action) {
			if (!action) {
				return;
			}
			var options: any = {};
			if (action.label === SAVE) {
				options.save = true;
			}
			if (action.label === SAVE_DEV) {
				options["save-dev"] = true;
			}

			installPackage(pkg.name, options);
		});
	}

	function installPackage(name: string, options: any) {
		progressIndicator.beginTask("bower install");
		bower.commands
			.install([name], options)
			.on('error', function(installed) {
				progressIndicator.endTask("bower install");
				console.log(installed);
				vscode.window.showErrorMessage('bower install failed! View Output window for further details');
			}).on('end', function() {
				progressIndicator.endTask("bower install");
				vscode.window.showInformationMessage("bower package '" + name + "' successfully installed!");
			}).on('prompt', function(prompts, callback) {
				adapter.prompt(prompts, callback);
			});
	}
}
