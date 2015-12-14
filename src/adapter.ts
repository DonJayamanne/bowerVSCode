'use strict';


import {window, OutputChannel, ViewColumn} from 'vscode';
import * as util from 'util';
import PromptFactory from './prompts/factory';
import EscapeException from './utils/EscapeException';

export default class CodeAdapter {

	private outChannel: OutputChannel;
	private outBuffer: string = '';
	private messageLevelFormatters = {};
	constructor() {
		let self = this;

		this.messageLevelFormatters["conflict"] = this.formatConflict;
		this.messageLevelFormatters["info"] = this.formatInfo;
		this.messageLevelFormatters["action"] = this.formatAction;

		this.outChannel = window.createOutputChannel('Bower');
		this.outChannel.clear();
	}

	public logError(message: any) {
		var line = `error: ${message.message}\n    Code - ${message.code}`;

		this.outBuffer += `${line}\n`;
		this.outChannel.appendLine(line);
	}

	private formatInfo(message: any) {
		const prefix = `${message.level}: (${message.id}) `;
		if (message.id === "json") {
			var jsonString = JSON.stringify(message.data, null, 4);
			return `${prefix}${message.message}\n${jsonString}`;
		}
		else {
			return `${prefix}${message.message}`;
		}
	}

	private formatAction(message: any) {
		const prefix = `info: ${message.level}: (${message.id}) `;
		return `${prefix}${message.message}`;
	}

	private formatMessage(message: any) {
		const prefix = `${message.level}: (${message.id}) `;
		return `${prefix}${message.message}`;
	}

	private formatConflict(message: any) {
		var msg = message.message + ':\n';
		var picks = (<any[]>message.data.picks);
		var pickCount = 1;
		picks.forEach((pick) => {
			let pickMessage = (pickCount++).toString() + "). " + pick.endpoint.name + "#" + pick.endpoint.target;
			if (pick.pkgMeta._resolution && pick.pkgMeta._resolution.tag) {
				pickMessage += " which resolved to " + pick.pkgMeta._resolution.tag
			}
			if (Array.isArray(pick.dependants) && pick.dependants.length > 0) {
				pickMessage += " and is required by ";
				pick.dependants.forEach((dep) => {
					pickMessage += " " + dep.endpoint.name + "#" + dep.endpoint.target;
				});
			}
			msg += "    " + pickMessage + "\n";
		});

		var prefix = (message.id === "solved"? "info" : "warn") + `: ${message.level}: (${message.id}) `;
		return prefix + msg;
	}

	public log(message: any) {
		var line: string = "";
		if (message && typeof (message.level) === "string") {
			let formatter: (any) => string = this.formatMessage;
			if (this.messageLevelFormatters[message.level]) {
				formatter = this.messageLevelFormatters[message.level];
			}
			line = formatter(message);
		}
		else {
			line = util.format(arguments);
		}

		this.outBuffer += `${line}\n`;
		this.outChannel.appendLine(line);
	}

	public clearLog() {
		this.outChannel.clear();
	}

	public showLog() {
		this.outChannel.show();
	}

	private fixQuestion(question) {
		if (question.type === "checkbox" && Array.isArray(question.choices)) {
			//For some reason when there's a choice of checkboxes, they aren't formatted properly
			//Not sure where the issue is
			question.choices = question.choices.map(item=> {
				if (typeof (item) === "string") {
					return { checked: false, name: item, value: item };
				}
				else {
					return item;
				}
			});
		}
	}

	public prompt(questions, callback) {
		let answers = {};

		var promise = questions.reduce((promise, question) => {
			this.fixQuestion(question);

			return promise.then(() => {
				return PromptFactory.createPrompt(question);
			}).then(prompt => {
				if (!question.when || question.when(answers) === true) {
					return prompt.render().then(result => answers[question.name] = question.filter ? question.filter(result) : result);
				}
			});
		}, Promise.resolve());

		promise
			.then(() => {
				this.outChannel.clear();
				this.outChannel.append(this.outBuffer);

				callback(answers);
			})
			.catch(err => {
				if (err instanceof EscapeException) {
					return;
				}

				window.showErrorMessage(err.message);
			});
	}
}
