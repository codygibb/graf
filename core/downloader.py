from urllib2 import urlopen
from zipfile import ZipFile
from StringIO import StringIO

url = urlopen('https://github.com/erikrose/parsimonious/archive/master.zip')
zfile = ZipFile(StringIO(url.read()))
for finfo in zfile.infolist():
	print zfile.read(finfo)