import unittest

import core.utils as utils


class TestUtils(unittest.TestCase):

	def test_download_repo_zip(self):
		zfile = utils.download_repo_zip('https://github.com/codygibb/graf')
		self.assertTrue(len(zfile.infolist()) > 0)
		