import unittest

import core.utils as utils


class TestUtils(unittest.TestCase):
	
	def test_download_zip_and_get_files(self):
		results = utils.download_zip_and_get_files('https://github.com/codygibb/graf/archive/master.zip')
		self.assertTrue(len(results) > 0)
		