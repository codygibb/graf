from zipfile import ZipFile
import json
from os import path

from flask import Flask, request, make_response

from core.codebase import Codebase
from core.python_project import PythonProject
import core.utils as utils

app = Flask(__name__)

supported_langs = {
	'Python': PythonProject
}


@app.route('/')
def index():
	return app.send_static_file('views/index.html')


@app.route('/parse/<language>')
def parse(language):
	try:
		codebase = supported_langs[language]()
	except KeyError:
		return 'language not supported', 400

	zip_url = request.args.get('repo_url') + '/archive/master.zip'
	files = utils.download_zip_and_get_files(zip_url)

	for filename, fcontents in files:
		stripped_fname = filename.split('/', 1)[1]
		codebase.register(stripped_fname, fcontents)

	roots = codebase.build_dependency_tree()

	res = make_response(codebase.to_json(roots), 200)
	res.mimetype = 'application/json'
	return res


@app.route('/supported_langs')
def get_available_langs():
	res = make_response(json.dumps(list(supported_langs.keys())), 200)
	res.mimetype = 'application/json'
	return res


@app.route('/<path:path>')
def static_proxy(path):
	return app.send_static_file(path)


if __name__ == '__main__':
	app.run(debug=True)