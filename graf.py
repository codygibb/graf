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

	zfile = utils.download_repo_zip(request.args.get('project_url'))

	for info in zfile.infolist():
		stripped_fname = info.filename.split('/', 1)[1]
		try:
			# decoding the bytes of zfile to utf-8 might fail
			contents = zfile.read(info).decode('utf-8')
			codebase.register(stripped_fname, contents)
		except:
			pass

	roots = codebase.build_dependency_tree()

	res = make_response(json.dumps(roots), 200)
	res.mimetype = 'application/json'
	return res
		

if __name__ == '__main__':
	app.run(debug=True)