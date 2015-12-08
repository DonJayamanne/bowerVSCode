// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CodeAdapter from './../adapter';
import ProgressIndicator from './../progressIndicator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export default function uninstall(adapter: CodeAdapter, progressIndicator:ProgressIndicator) {
	var cwd = vscode.workspace.rootPath;
	process.chdir(cwd);
	var bower = require('bower');

	bower.commands
		.list({paths:true}, { offline: true })
		.on('error', function(installed) {
			console.log(installed);
			vscode.window.showErrorMessage('bower uninstall failed! View Output window for further details');
		}).on('end', function(installed) {
			var installedPackages = Object.keys(installed);
			var packages = installedPackages.map(item=> { return { 
				label: item, 
				description: Array.isArray(installed[item]) ? installed[item][0] : installed[item], 
				name: item } });
			//console.log(installed);
			displayPackageList(packages);
		});

	function displayPackageList(packages: vscode.QuickPickItem[]) {
		vscode.window.showQuickPick(packages, { placeHolder: "Select the package to uninstall" }).then(function(item) {
			//displayPackageForUnInstallation(item);
			if (!item) {
				return;
			}
			displayPackageForUnInstallation(item);
		});
	}
	const UNINSTALL_NO_UPDATE = "Uninstall";
	const UNINSTALL = "Uninstall from dependency";
	const UNINSTALL_DEV = "Uninstall from devDependency";
	function displayPackageForUnInstallation(pkg: any) {
		var actions = [
			{ label: UNINSTALL_NO_UPDATE, description: "bower uninstall <name>" },
			{ label: UNINSTALL, description: "Uninstall from bower.json dependencies (bower uninstall <name> --save)" }//,
			// { label: UNINSTALL_DEV, description: "Uninstall from bower.json devDependencies (bower uninstall <name> --save-dev)" }
		];
		vscode.window.showQuickPick(actions, { placeHolder: "Install " + pkg.label }).then(function(action) {
			if (!action){
				return;
			}
			var options: any = {};
			// options.save = true;
			// options["save-dev"] = true;
			if (action.label === UNINSTALL) {
				options.save = true;
			}
			if (action.label === UNINSTALL_DEV) {
				options["save-dev"] = true;
			}
			
			confirmUninstallPackage(pkg.name, options);
		});
	}

	function confirmUninstallPackage(packageName: string, options: any) {
		vscode.window.showWarningMessage("Are you sure you want to uninstall '" + packageName + "'?", "Yes").then(function(cmd) {
			if (cmd === "Yes") {
				uninstallPackage(packageName, options);
			}
		});
	}
	
	function uninstallPackage(name: string, options: any) {
		// var reject:(any)=>void = null;
		// var resolve:(any)=>void = null;
		// var def = new Promise((res, rej)=>{
		// 	resolve = res;
		// 	reject =rej;
		// });
		
		bower.commands
			.uninstall([name], options)
			.on('error', function(ex) {
				console.log(ex);
				vscode.window.showErrorMessage('bower uninstall failed! View Output window for further details');
				// reject(ex);
			}).on('end', function(msg) {
				// if (showMessage){
					vscode.window.showInformationMessage("bower package '" + name + "' successfully uninstalled!");
				// }
				// resolve(msg);
			}).on('log', function(msg) {
				//console.log(msg);
			}).on('prompt', function(prompts, callback) {
				adapter.prompt(prompts, callback);
			});
			
		// return def;
	}
}
