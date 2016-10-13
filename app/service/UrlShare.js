class UrlShare {
	constructor() {
		this.secret = 'e';
		this.decryptedData = {};
		this.inputs = {};
		this.url = '';
	}
	getInputs() {
		return this.inputs;
	}
	setInputs(inputs) {
		this.inputs = inputs;
		this.createUrl();
	}
	createUrl() {
		var inputs = JSON.parse(JSON.stringify(this.inputs));
		this.compress(inputs, compressCb.bind(this));
		function compressCb(error, ciphertext) {
			if (error) {
				console.log(error);
				return;
			}
			this.url = ciphertext;
			if (window.location.href.indexOf('#?default=true') > -1) {
				window.location.href = window.location.href.split('?default=true')[0];
			}
			window.location.href = '#?input_state=' + ciphertext;
		}
	}
	decryptUrl(cb) {
		return new Promise((resolve, reject) => {
			var url = window.location.href.split('#?input_state=');
			if (url.length > 1) {
				this.decompress(url[1], function(error, data) {
					resolve({ error: error, data: data });
				});
			} else {
				resolve({ error: 'Empty url' });
			}
		});
	}
	convertToUrl(type) {
		var ciphertext = this.url;
		var final_url = '';
		if (type == 'gh-pages') {
			final_url = 'appbaseio.github.io/mirage/#?input_state=' + ciphertext;
		} else {
			final_url = window.location.protocol + '//' + window.location.host + '#?input_state=' + ciphertext;
		}
		return final_url;
	}
	dejavuLink() {
		var obj = {
			url: this.inputs.config.url,
			appname: this.inputs.config.appname,
			selectedType: this.inputs.selectedTypes
		};
		var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(obj), 'dejvu').toString();
		var final_url = 'http://appbaseio.github.io/dejaVu/live/#?input_state=' + ciphertext;
		return final_url;
	}
	compress(jsonInput, cb) {
		if (!jsonInput) {
			return cb('Input should not be empty');
		} else {
			var packed = JSON.stringify(jsonInput);
			JSONURL.compress(packed, 9, function(res, error) {
				try {
					var result = SafeEncode.buffer(res);
					cb(null, SafeEncode.encode(result));
				} catch (e) {
					cb(e);
				}
			});
		}
	}

	decompress(compressed, cb) {
		var self = this;
		if (compressed) {
			var compressBuffer = SafeEncode.buffer(compressed);
			JSONURL.decompress(SafeEncode.decode(compressBuffer), function(res, error) {
				var decryptedData = res;
				try {
					if (decryptedData) {
						decryptedData = JSON.parse(decryptedData);
						self.decryptedData = decryptedData;
						cb(null, decryptedData);
					} else {
						cb('Not found');
					}
				} catch (e) {
					cb(e);
				}
			});
		} else {
			return cb('Empty');
		}
	}
}
export const urlShare = new UrlShare();
