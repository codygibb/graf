from urllib.request import urlopen
from zipfile import ZipFile
from io import BytesIO


def download_zip_and_get_files(zip_url):
	""" Given the url of a zipped folder, downloads/extracts it and returns a
	list of tuples containing (filename, file_contents)
	"""
	stream = BytesIO(urlopen(zip_url).read())
	zfile = ZipFile(stream)

	results = []
	for info in zfile.infolist():
		try:
			# decoding the bytes of zfile to utf-8 might fail
			contents = zfile.read(info).decode('utf-8')
			results.append((info.filename, contents))
		except:
			pass

	return results