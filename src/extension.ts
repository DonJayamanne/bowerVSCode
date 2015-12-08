// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import PromptFactory from './prompts/factory';
import CodeAdapter from './adapter';
import ProgressIndicator from './progressIndicator';
import init from './commands/init';
import restore from './commands/restore';
import list from './commands/list';
import uninstall from './commands/uninstall';
import update from './commands/update';
import * as bowerCache from './commands/cache';
import * as bowerSearch from './commands/search';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "bowerpm" is now active!');

	var adapter = new CodeAdapter();
	var progressIndicator = new ProgressIndicator();

	var commansAndHandlers = [
		{
			"label": "Bower Init",
			"description": "Create bower.json (bower init)",
			"handler": function() { init(adapter, progressIndicator); }
		},
		{
			"label": "Bower Install",
			"description": "Restore packages defined in bower.json (bower install)",
			"handler": function() { restore(adapter, progressIndicator); }
		},
		// {
		// 	"label": "Bower List",
		// 	"description": "",
		// 	"handler": function() { list(adapter); }
		// },
		{
			"label": "Bower Search and Install",
			"description": "Search for a package and install it",
			"handler": function() { bowerSearch.search(adapter, progressIndicator); }
		},
		{
			"label": "Bower Uninstall",
			"description": "Select and uninstall a package",
			"handler": function() { uninstall(adapter, progressIndicator); }
		},
		{
			"label": "Bower Update",
			"description": "Update all packages or a selected package (bower update)",
			"handler": function() { update(adapter, progressIndicator); }
		},
		{
			"label": "Bower Cache - Clear",
			"description": "Clear bower cache (bower cache clear)",
			"handler": function() { bowerCache.cleanEverythingFromCache(adapter, progressIndicator); }
		},
		{
			"label": "Bower Cache - List",
			"description": "List the items in the bower cache and action them",
			"handler": function() { bowerCache.listCache(adapter, progressIndicator); }
		}
	];

	var disposable = vscode.commands.registerCommand('extension.bower', () => {
		vscode.window.showQuickPick(commansAndHandlers).then(cmd=> {
			if (!cmd) {
				return;
			}
			adapter.clearLog();
			cmd.handler();
		});
	});

	context.subscriptions.push(disposable);
}
