


	var rx_string  = /(^NAME\.|[=+\*\/\\(\[\{\-]{1}NAME\.)/;
	for (var i = 0; i < lines.length(); i++) {
		line = lines[i].replace(/ /g, '');
		for each module in modules.keys() {}
			var rx = new RegExp(rx_string.split("NAME").join(module));
			if (rx.test(line)) {
				if (module in module_counts) {
					modules[module]++;
				} else {
					modules[module] = 1;
				}
			}
		}
	}