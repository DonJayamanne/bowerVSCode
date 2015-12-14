// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CodeAdapter from './../adapter';
import ProgressIndicator from './../progressIndicator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function listCache(adapter: CodeAdapter, progressIndicator:ProgressIndicator) {
	var bower = require('bower');

	progressIndicator.beginTask("bower list");
	
	bower.commands.cache
		.list()
		.on('error', function(ex) {
			progressIndicator.endTask("bower list");
			adapter.logError(ex);
			vscode.window.showErrorMessage('bower cache list failed! View Output window for further details');
		}).on('log', function(msg) {
			adapter.log(msg);
		}).on('end', function(installed) {
			progressIndicator.endTask("bower list");
			var packages = installed.map(pkg=> {
				var item = pkg.pkgMeta; 
				return { label: item.name, 
					description: "Version :" + item.version + (item.license ? ", License : " + item.license : ""), 
					name: item.name + "#" + item.version, 
					homepage: item.homepage } 
				});
				
			displayCachedPackageList(packages);
		}).on('prompt', function(prompts, callback) {
			adapter.prompt(prompts, callback);
		});


	function displayCachedPackageList(packages: vscode.QuickPickItem[]) {
		vscode.window.showQuickPick(packages, { placeHolder: "" }).then(function(item) {
			if (!item){
				return;
			}

			doSomethingWithCachedPackage(<any>item);;
		});
	}
	const REMOVE_COMMAND:string = "Remove from cache";
	 
	function doSomethingWithCachedPackage(pkg:any) {
		var msg = pkg.label + " " + pkg.description;
		var actions = [
			{label:REMOVE_COMMAND, description:"bower cache clear " + pkg.name}
			];
		
		if (typeof(pkg.homepage) === "string" && pkg.homepage.length > 0){
			//To be supported later
			//actions.push("View package online");
		}
		
		vscode.window.showQuickPick(actions, {placeHolder:msg}).then(action=>{
			if (!action){
				return;
			}
			if (action.label === REMOVE_COMMAND){
				removePackageFromCache(pkg.name);
			}
		});
	}
	function removePackageFromCache(name: string) {
		progressIndicator.beginTask("bower cache clear");
		bower.commands.cache
			.clean([name])
			.on('error', function(ex) {
				progressIndicator.endTask("bower cache clear");
				adapter.logError(ex);
				vscode.window.showErrorMessage('Failed to remove an item from cache! View Output window for further details');
			}).on('log', function(msg) {
				adapter.log(msg);
			}).on('end', function() {
				progressIndicator.endTask("bower cache clear");
				vscode.window.showInformationMessage("bower package '" + name + "' successfully removed from cache!");
			}).on('prompt', function(prompts, callback) {
				adapter.prompt(prompts, callback);
			});
	}
}

export function cleanEverythingFromCache(adapter: CodeAdapter, progressIndicator:ProgressIndicator) {
	var bower = require('bower');

	vscode.window.showWarningMessage("Are you sure you want to clear the bower cache?", "Yes").then(function(cmd) {
		if (cmd === "Yes") {
			clearBowerCache();
		}
	});

	function clearBowerCache() {		
		progressIndicator.beginTask("bower cache clear");
		bower.commands.cache
			.clean()
			.on('error', function(error) {
				progressIndicator.endTask("bower cache clear");
				adapter.logError(error);
				vscode.window.showErrorMessage('Failed to clean the bower cache! View Output window for further details');
			}).on('log', function(msg) {
				adapter.log(msg);
			}).on('end', function() {
				progressIndicator.endTask("bower cache clear");
				vscode.window.showInformationMessage("bower cache cleared successfully!");
			}).on('prompt', function(prompts, callback) {
				adapter.prompt(prompts, callback);
			});
	}
}
