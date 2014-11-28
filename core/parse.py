from parsimonious.grammar import Grammar, NodeVisitor
import os
import abc
import collections

DIR = os.path.dirname(__file__)
GRAMMAR_DIR = os.path.join(DIR, 'grammars')
TEST_PROGRAM_DIR = os.path.join(DIR, 'test')


class PackageNode(object):
	def __init__(self, name):
		self.name = name
		self.sub_packages = []
		self.sub_modules = []

	def __repr__(self):
		return self.name

	def __eq__(self, other):
		return (self.name == other.name and
				self.sub_packages == other.sub_packages and
				self.sub_modules == other.sub_modules)


class ModuleNode(object):
	def __init__(self, name):
		self.name = name
		self.package_deps = []
		self.module_deps = []

	def __repr__(self):
		return self.name

	def __eq__(self, other):
		return (self.name == other.name and
				self.package_deps == other.package_deps and
				self.module_deps == other.module_deps)


# module -> [dependency1, dependency2, dependency3, ...]
class Codebase(object):
	__metaclass__ = abc.ABCMeta

	def __init__(self, peg_file):
		with open(peg_file) as peg_fh:
			self._grammar = Grammar(peg_fh.read())
		self._roots = []

	@abc.abstractmethod
	def register_dependencies(self, filepath, contents):
		""" Given input program (full path + contents), parse its dependencies 
		and add them to the current project state """
		return

	@abc.abstractmethod
	def build_dependency_tree(self):
		return

class PythonProject(Codebase):
	""" A python project is defined by having folder packages, with __init__.py defining
	when a folder is indeed a package. Within a particular folder/package, there can be
	multiple .py files. Any other python file can import the entire package, or just
	a piece of the package (or in fact a piece of a piece of the package). So in a graph
	representation of a python project, vertices would still be individual .py files,
	but each file is prefixed by its parent package

	Given the following project:
	py_project/
		__init__.py
		module0.py
		packageA/
			__init__.py
			module1.py
			module2.py
		packageB/
			__init__.py
			module3.py
			packageC/
				__init__.py
				module4.py

	Our list of vertices would be ["module0", "packageA.module1", "packageA.module2", 
								   "packageB.module3", "packageB.packageC.module4"]

	If, for example, packageB.module3 declares "import packageA", then there
	would be edges going from packageB.module3 to the entire contents of packageA.
	Because of this, it would be prudent to group modules together by package in
	a visual representation.
	"""
	def __init__(self):
		py_peg_file = os.path.join(GRAMMAR_DIR, 'python.peg')
		Codebase.__init__(self, py_peg_file)

		# each "package folder" (a folder with an __init__.py) will keep track
		# of all the 
		self._package_folders = set()
		self._dep_map = {}

	def register_dependencies(self, filepath, contents):
		splitext = os.path.splitext(filepath)
		if os.path.basename(filepath) == '__init__.py':
			folder = os.path.dirname(filepath).replace('/', '.')
			self._package_folders.add(folder)
			# print 'folder:', folder
		elif splitext[1] == '.py':
			name = splitext[0].replace('/', '.')
			self._dep_map[name] = []
			root = self._grammar.parse(contents)
			self._traverse_tree(root, name)

	def build_dependency_tree(self):
		roots = []

		# preprocess modules/packages nodes -- map the string name to the node object
		pname_to_node = {}
		for p in self._package_folders:
			pname_to_node[p] = PackageNode(self._get_basename(p))
		mname_to_node = {}
		for m in self._dep_map:
			mname_to_node[m] = ModuleNode(self._get_basename(m))

		for m in self._dep_map:
			curr_node = mname_to_node[m]

			self._register_parent_package(m, curr_node, pname_to_node, roots)

			# go through the dependecies of the current module, and link each
			# to the appropriate package/module node object
			for dep in self._dep_map[m]:
				dep = self._normalize_import(m, dep)
				if dep in pname_to_node:
					mnode = pname_to_node[dep]
					curr_node.package_deps.append(mnode)
				elif dep in mname_to_node:
					fnode = mname_to_node[dep]
					curr_node.module_deps.append(fnode)

		# attempt to register each package as a child of its parent package
		for p in self._package_folders:
			curr_node = pname_to_node[p]
			self._register_parent_package(p, curr_node, pname_to_node, roots)

		# def traverse(root):
		# 	if root:
		# 		print root.name
		# 		try:
		# 			for p in root.sub_packages: traverse(p)
		# 			for m in root.sub_modules: traverse(m)
		# 		except:
		# 			for p in root.package_deps: traverse(p)
		# 			for m in root.module_deps: traverse(m)

		# for r in roots:
		# 	traverse(r)
		
		return roots

	def print_status(self):
		print 'dep map:'
		for p in self._dep_map:
			print "%s -> %s" % (p, self._dep_map[p])
		print
		print 'package folders:'
		for m in self._package_folders:
			print m

	# PRIVATE HELPER METHODS
	
	def _get_basename(self, name):
		split = name.rsplit('.', 1)
		try:
			return split[1]
		except:
			return split[0]
	
	def _register_parent_package(self, name, node, package_lookup, roots):
		split = name.rsplit('.', 1)
		if len(split) == 1:
			# no parent package, so must be a root
			roots.append(node)
		else:
			parent_package = split[0]
			try:
				if node.__class__.__name__ == 'ModuleNode':
					package_lookup[parent_package].sub_modules.append(node)
				else:
					package_lookup[parent_package].sub_packages.append(node)
			except:
				pass

	def _traverse_tree(self, root, name):
		if not root: return

		if root.expr_name == 'import_name':	
			self._import_name(root, name)
		else:
			for child in root.children:
				self._traverse_tree(child, name)

	def _import_name(self, root, name):
		self._search_for_expr(root, 'dotted_name', self._dep_map[name])
	
	def _normalize_import(self, filepath, name):
		""" Convert a relative import to the full path of the module/package being imported
		filepath -> path of file. ex: "my_project/packageA/file1.py"
		name     -> name of module/package being imported w/ relative dotted name.
					ex: ".file2", or "..packageB.file3"
		"""
		if name[0] != '.': return name

		path_arr = filepath.split('/')
		i = 0
		while i < len(name) and name[i] == '.':
			i += 1

		return '.'.join(path_arr[:-i]) + '.' + name[i:]

	def _search_for_expr(self, root, expr, results):
		if not root: return

		if root.expr_name == expr:
			results.append(root.text)
		else:
			for child in root.children:
				self._search_for_expr(child, expr, results)

def process_test_project(codebase, project_dir):
	for dirpath, dirnames, filenames in os.walk(project_dir):
		for fname in filenames:
			filepath = os.path.join(dirpath, fname)
			with open(filepath) as fh:
				codebase.register_dependencies(filepath, fh.read())
	print
	codebase.print_status()
	print
	codebase.build_dependency_tree()


# testf = os.path.join(TEST_PROGRAM_DIR, 'py')

if __name__ == '__main__':
	py_project = PythonProject()
	process_test_project(py_project, 'py_project')