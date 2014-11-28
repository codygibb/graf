import unittest
from core.parse import PythonProject
# from core.parse import PythonProject

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
	module3 -> packageA and packageC
	module4 -> module0

	with this "simple" structure, different import formats are tested
	"""

	def setUp(self):
		self.py_project = PythonProject()

	def test_normalize_import(self):
		fpath = 'my_project/packageA/module1.py'

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

	# IMPORT_NAME TESTS

	def test_simple_import_name_register_dependencies(self):
		fcontents = self._build_simple_import_name_project()
		self._simple_register_deps_check(fcontents)

	def test_simple_import_name_build_dependency_tree(self):
		fcontents = self._build_simple_import_name_project()
		self._shallow_simple_dependency_tree_check(fcontents)
	
	# PRIVATE HELPER METHODS
	
	def _simple_register_deps_check(self, fcontents):
		package_folders = {'project', 'project.packageA', 'project.packageB', 'project.packageB.packageC'}
		dep_map = {
			'project.module0': ['project.packageA.module1'],
			'project.packageA.module1': ['project.packageA.module2'],
			'project.packageA.module2': [],
			'project.packageB.module3': ['project.packageA', 'project.packageB.packageC'],
			'project.packageB.packageC.module4': ['project.module0']
		}
		self._register_project_deps(fcontents)
		self.assertSetEqual(package_folders, self.py_project._package_folders)
		self.assertDictEqual(dep_map, self.py_project._dep_map)
	
	def _shallow_simple_dependency_tree_check(self, fcontents):
		self._register_project_deps(fcontents)
		roots = self.py_project.build_dependency_tree()

		self.assertEqual(len(roots), 1)
		self.assertEqual(roots[0].name, 'project')

		self.assertEqual(len(roots[0].sub_packages), 2)
		self.assertEqual(len(roots[0].sub_modules), 1)

		self.assertEqual(len(roots[0].sub_modules[0].module_deps), 1)
		self.assertEqual(roots[0].sub_modules[0].module_deps[0].name, 'module1')
		self.assertEqual(roots[0].sub_modules[0].module_deps[0].module_deps[0].name, 'module2')

	def _build_simple_import_name_project(self):
		fcontents = {}
		fcontents['project/__init__.py'] = ''
		fcontents['project/module0.py'] = 'import project.packageA.module1'

		fcontents['project/packageA/__init__.py'] = ''
		fcontents['project/packageA/module1.py'] = 'import project.packageA.module2'
		fcontents['project/packageA/module2.py'] = ''

		fcontents['project/packageB/__init__.py'] = ''
		fcontents['project/packageB/module3.py'] = 'import project.packageA\nimport project.packageB.packageC'

		fcontents['project/packageB/packageC/__init__.py'] = ''
		fcontents['project/packageB/packageC/module4.py'] = 'import project.module0'

		return fcontents

	def _register_project_deps(self, fcontents):
		for fpath in fcontents:
			self.py_project.register_dependencies(fpath, fcontents[fpath])

if __name__ == '__main__':
	unittest.main(verbosity=2)