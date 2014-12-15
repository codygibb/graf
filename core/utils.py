from urllib.request import urlopen
from zipfile import ZipFile
from io import BytesIO


def download_repo_zip(project_url):
	zip_url = urlopen(project_url + '/archive/master.zip')
	stream = BytesIO(zip_url.read())
	return ZipFile(stream)