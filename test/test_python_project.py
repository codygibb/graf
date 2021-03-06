import unittest
import os
import json

from core.python_project import PythonProject
from core.codebase import ModuleNode, PackageNode

unittest.TestCase.maxDiff = None


class TestPythonProject(unittest.TestCase):
	"""
	this test suite uses the following project structure for all of the tests marked as "simple":

	project/
		module0
		packageA/
			module1
			module2
		packageB/
			module3
			packageC/
				module4

	module0 -> module1
	module1 -> module2
	module2 -> ø
	module3 -> packageC, module1,  module2
	module4 -> module0

	with this "simple" structure, different import formats are tested
	"""

	def setUp(self):
		self.py_project = PythonProject()

	def test_normalize_import(self):
		fpath = 'my_project.packageA.module1'

		name = '.module2'
		res = self.py_project._normalize_import(fpath, name)
		self.assertEqual(res, 'my_project.packageA.module2')

		name = '..module0'
		res = self.py_project._normalize_import(fpath, name)
		self.assertEqual(res, 'my_project.module0')

		name = '..packageB.module3'
		res = self.py_project._normalize_import(fpath, name)
		self.assertEqual(res, 'my_project.packageB.module3')

		name = 'my_project.packageC.module4'
		res = self.py_project._normalize_import(fpath, name)
		self.assertEqual(res, 'my_project.packageC.module4')

	def test_simple_IMPORT_NAME_build_dependency_tree(self):
		fcontents = self._build_simple_IMPORT_NAME_project()
		self._check_simple_dependency_tree(fcontents)

	def test_simple_IMPORT_FROM_build_dependency_tree(self):
		fcontents = self._build_simple_IMPORT_FROM_project()
		self._check_simple_dependency_tree(fcontents)

	def test_simple_RELATIVE_IMPORTS_project(self):
		fcontents = self._build_simple_RELATIVE_IMPORTS_project()
		self._check_simple_dependency_tree(fcontents)

	def test_parse_complex_project(self):
		filepath = os.path.join(os.path.dirname(__file__), 'programs/test.py')
		with open(filepath) as fh:
			self.py_project._grammar.parse(fh.read())

	def test_parse_myself(self):
		with open(__file__) as fh:
			self.py_project._grammar.parse(fh.read())

	# PRIVATE HELPER METHODS
	
	def _check_simple_dependency_tree(self, fcontents):
		project = PackageNode('project')
		m0 = ModuleNode('module0')
		pA = PackageNode('packageA')
		m1 = ModuleNode('module1')
		m2 = ModuleNode('module2')
		pB = PackageNode('packageB')
		m3 = ModuleNode('module3')
		pC = PackageNode('packageC')
		m4 = ModuleNode('module4')

		project.children = [pA, pB, m0]
		project.parents = []

		m0.children = [m1]
		m0.parents = [project, m4]

		pA.children = [m1, m2]
		pA.parents = [project]

		m1.children = [m2]
		m1.parents = [m0, m3, pA]

		m2.children = []
		m2.parents = [pA, m1, m3]

		pB.children = [pC, m3]
		pB.parents = [project]

		m3.children = [pC, m1, m2]
		m3.parents = [pB]

		pC.children = [m4]
		pC.parents = [pB, m3]

		m4.children = [m0]
		m4.parents = [pC]

		expected_roots = [project]

		self._register_project(fcontents)
		roots = self.py_project.build_dependency_tree()

		self.assertCountEqual(roots, expected_roots)

	def _build_simple_IMPORT_NAME_project(self):
		fcontents = {}
		fcontents['project/__init__.py'] = ''
		fcontents['project/module0.py'] = 'import project.packageA.module1 as m1'

		fcontents['project/packageA/__init__.py'] = ''
		fcontents['project/packageA/module1.py'] = 'import project.packageA.module2'
		fcontents['project/packageA/module2.py'] = ''

		fcontents['project/packageB/__init__.py'] = ''
		fcontents['project/packageB/module3.py'] = 'import project.packageB.packageC as pC, project.packageA.module1 as m1, project.packageA.module2 as m2'

		fcontents['project/packageB/packageC/__init__.py'] = ''
		fcontents['project/packageB/packageC/module4.py'] = 'import project.module0'

		return fcontents

	def _build_simple_IMPORT_FROM_project(self):
		fcontents = {}
		fcontents['project/__init__.py'] = ''
		fcontents['project/module0.py'] = 'from project.packageA.module1 import SomeRandomClass, AnotherClass'

		fcontents['project/packageA/__init__.py'] = ''
		fcontents['project/packageA/module1.py'] = 'from project.packageA import module2'
		fcontents['project/packageA/module2.py'] = ''

		fcontents['project/packageB/__init__.py'] = ''
		fcontents['project/packageB/module3.py'] = 'from project.packageB import packageC\nfrom project.packageA import module1 as m1, module2 as m2'

		fcontents['project/packageB/packageC/__init__.py'] = ''
		fcontents['project/packageB/packageC/module4.py'] = 'from project.module0 import some_random_method as srm'

		return fcontents

	def _build_simple_RELATIVE_IMPORTS_project(self):
		fcontents = {}
		fcontents['project/__init__.py'] = ''
		fcontents['project/module0.py'] = 'from .packageA import module1 as m1'

		fcontents['project/packageA/__init__.py'] = ''
		fcontents['project/packageA/module1.py'] = 'from . import module2'
		fcontents['project/packageA/module2.py'] = ''

		fcontents['project/packageB/__init__.py'] = ''
		fcontents['project/packageB/module3.py'] = 'from . import packageC\nfrom ..packageA import module1\nfrom ..packageA import module2 as m2'

		fcontents['project/packageB/packageC/__init__.py'] = ''
		fcontents['project/packageB/packageC/module4.py'] = 'from ... import module0'

		return fcontents

	def _register_project(self, fcontents):
		for fpath in fcontents:
			self.py_project.register(fpath, fcontents[fpath])

if __name__ == '__main__':
	unittest.main(verbosity=2)