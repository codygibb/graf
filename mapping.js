

function identifyModules(data) {
	lines = data.split("\n");

	var rx = new RegExp(/[_A-Za-z][_A-Za-z0-9]+[ \t]*=[ \t]*require\(["'].+["']\)/);

	module_path_map = {};  // maps module abrev to module path

	lines.foreach(function(line) {
		
		if (rx.test(line)) {
			array = line.split('=');

			right = array[1].replace('\'', '"');
			path = right.split('"')[1];

			left = array[0].trim();
			left_array = left.split(/[ \t]+/);
			if (left_array.length == 1) {
				module_path_map[left_array[0]] = path;
			} else {
				module_path_map[left_array[1]] = path;
			}
		}

	});
	return module_path_map;
}

function measureModuleUsage() {
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
}

module.exports = mapping 