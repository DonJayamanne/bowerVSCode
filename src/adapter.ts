'use strict';


import {window, OutputChannel, ViewColumn} from 'vscode';
import * as util from 'util';
import PromptFactory from './prompts/factory';
import EscapeException from './utils/EscapeException';

export default class CodeAdapter {

	private outChannel: OutputChannel;
	private outBuffer: string = '';

	constructor() {
		let self = this;

		this.outChannel = window.createOutputChannel('Bower');
		this.outChannel.clear();
		this.outChannel.show();
	}

	public log(message: any) {
		const line = util.format.apply(util, arguments);

		this.outBuffer += `${line}\n`;
		this.outChannel.appendLine(line);
	}

	public clearLog() {
		this.outChannel.clear();
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
