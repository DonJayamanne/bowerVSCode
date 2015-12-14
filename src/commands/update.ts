// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CodeAdapter from './../adapter';
import ProgressIndicator from './../progressIndicator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export default function update(adapter: CodeAdapter, progressIndicator: ProgressIndicator) {
	progressIndicator.beginTask("bower list");
	var bower = require('bower');

	bower.commands
		.list({ paths: true }, { offline: true })
		.on('error', function(error) {
			progressIndicator.endTask("bower list");
			adapter.logError(error);
			vscode.window.showErrorMessage('bower uninstall failed! View Output window for further details');
		}).on('log', function(msg) {
			adapter.log(msg);
		}).on('end', function(installed) {
			progressIndicator.endTask("bower list");
			var installedPackages = Object.keys(installed);
			var packages = installedPackages.map(item=> { return { label: item, description: (Array.isArray(installed[item]) ? installed[item][0] : installed[item]), name: item, all: false } });
			packages = [{ label: "All", description: "", name: "", all: true }].concat(packages);
			displayPackageList(packages);
		}).on('prompt', function(prompts, callback) {
			adapter.prompt(prompts, callback);
		});


	function displayPackageList(packages: vscode.QuickPickItem[]) {
		vscode.window.showQuickPick(packages, { placeHolder: "Select a package to update, or Select 'All'" }).then(function(item) {
			if (item) updatePackages(item);
		});
	}
	function updatePackages(pkg: any) {
		var pkgNames = null;
		var updateALL = true;
		if (pkg.all !== true) {
			pkgNames = [pkg.name];
			updateALL = false;
		}

		progressIndicator.beginTask("bower update");

		bower.commands
			.update(pkgNames)
			.on('error', function(error) {
				progressIndicator.endTask("bower update");
				adapter.logError(error);
				vscode.window.showErrorMessage('bower update failed! View Output window for further details');
			}).on('log', function(msg) {
				adapter.log(msg);
			}).on('end', function() {
				progressIndicator.endTask("bower update");
				var msg = "";
				if (updateALL) {
					msg = "bower packages updated successfully";
				}
				else {
					msg = "bower package '" + pkgNames[0] + "' updated successfully";
				}
				vscode.window.showInformationMessage(msg);
			}).on('prompt', function(prompts, callback) {
				adapter.prompt(prompts, callback);
			});
	}
}
