'use strict';

import {window, OutputChannel, ViewColumn, StatusBarItem, StatusBarAlignment} from 'vscode';

export default class ProgressIndicator {

	private _statusBarItem: StatusBarItem;

	constructor() {
		this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
   	}

	private _tasks: string[] = [];
	public beginTask(task: string) {
		this._tasks.push(task);
		this.displayProgressIndicator();
	}

	public endTask(task: string) {
		if (this._tasks.length > 0) {
			this._tasks.pop();
		}

		this.setMessage();
	}

	private setMessage() {
		if (this._tasks.length === 0) {
			this._statusBarItem.text = "";
			this.hideProgressIndicator();
			return;
		}

		this._statusBarItem.text = this._tasks[this._tasks.length - 1];
		this._statusBarItem.show();
	}

	private _interval: any;
	private displayProgressIndicator() {
		this.setMessage();
		this.hideProgressIndicator();
		//this.onDisplayProgressIndicator();
		this._interval = setInterval(() => this.onDisplayProgressIndicator(), 200);
	}
	private hideProgressIndicator() {
		if (this._interval) {
			clearInterval(this._interval);
			this._interval = null;
		}
		this.ProgressCounter = 0;
	}

	private ProgressText = ["|", "/", "-", "\\", "|", "/", "-", "\\"];
	private ProgressCounter = 0;
	private onDisplayProgressIndicator() {
		if (this._tasks.length === 0) {
			return;
		}

		var txt = this.ProgressText[this.ProgressCounter];
		this._statusBarItem.text = this._tasks[this._tasks.length - 1] + " " + txt;
		this.ProgressCounter++;

		if (this.ProgressCounter >= this.ProgressText.length - 1) {
			this.ProgressCounter = 0;
		}
	}
}
