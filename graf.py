from zipfile import ZipFile
import json
from os import path

from flask import Flask, request, make_response

from core.codebase import Codebase
from core.python_project import PythonProject
import core.utils as utils

app = Flask(__name__)


@app.route('/')
def home():
	return 'graf'


@app.route('/parse/<language>')
def parse(language):
	if language == 'python':
		codebase = PythonProject()
	else:
		return 'language not supported', 400

	zip_url = request.args.get('project_url') + '/archive/master.zip'
	files = utils.download_zip_and_get_files(zip_url)

	for filename, fcontents in files:
		stripped_fname = filename.split('/', 1)[1]
		codebase.register(stripped_fname, fcontents)

	roots = codebase.build_dependency_tree()

	res = make_response(codebase.to_json(roots), 200)
	res.mimetype = 'application/json'
	return res
		

if __name__ == '__main__':
	app.run(debug=True)