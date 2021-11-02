import {forEach, escapeRegExp, get} from "lodash";
export default class Token {

	constructor(tokensList) {
		this.tokensList = tokensList;
		this.findAndReplace = this.findAndReplace.bind(this);
		this.getTokensValue = this.getTokensValue.bind(this);
	}

	/**
	 * Find tokens in text and replace them.
	 *
	 * @param text {string}
	 * @param  data {object}
	 * @return {*}
	 */
	findAndReplace(text, data) {
		if (text) {
			let tokens = Token.findTokens(text);
			if (tokens) {
				let tokenValues = this.getTokensValue(tokens, data);
				text = Token.replaceTokensValues(tokenValues, text);
			}
			return text;
		}

		return '';
	}

	/**
	 * Find all tokens in text
	 * @param text {string}
	 *
	 * @return {array | null}
	 */
	static findTokens(text) {
		return text.match(/\{\{(.*?)\}\}/g);
	}

	/**
	 * Replace tokes by they values in the text.
	 *
	 * @param tokenValues {object}
	 * @param text {string}
	 *
	 * @return {string}
	 */
	static replaceTokensValues(tokenValues, text) {
		forEach(tokenValues, (value, tokenName) => {
			if (tokenName !== value) {
				let escaped = escapeRegExp(tokenName);
				let regex = new RegExp(escaped, "gi");

				text = text.replace(regex, value);
			}
		});

		return text;
	}

	getTokensValue(tokens, data) {
		let result = {};
		tokens.map(token => {

			let tokenCleanName =  token.match(/[^{][^}]*/g)[0];
			let value = '';

			if (this.tokensList[tokenCleanName]) {
				if (this.tokensList[tokenCleanName].callback) {
					value = this.tokensList[tokenCleanName].callback({parserData:data});
				} else {
					value = get(data, tokenCleanName, token);
				}
			}
			result[token] = value;
		});

		return result;
	}
}