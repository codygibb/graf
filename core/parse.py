from parsimonious.grammar import Grammar, NodeVisitor
import os
import abc
import collections
from collections import Counter

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

	def __hash__(self):
		return hash(self.name)

	def __eq__(self, other):
		return (self.name == other.name and
				Counter(self.sub_packages) == Counter(other.sub_packages) and
				Counter(self.sub_modules) == Counter(other.sub_modules))

class ModuleNode(object):
	def __init__(self, name):
		self.name = name
		self.package_deps = []
		self.module_deps = []

	def __repr__(self):
		return self.name

	def __hash__(self):
		return hash(self.name)

	def __eq__(self, other):
		return (self.name == other.name and
				Counter(self.package_deps) == Counter(other.package_deps) and
				Counter(self.module_deps) == Counter(other.module_deps))


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
			curr_mnode = mname_to_node[m]

			self._register_parent_package(m, curr_mnode, pname_to_node, roots)

			# go through the dependecies of the current module, and link each
			# to the appropriate package/module node object
			for dep in self._dep_map[m]:
				dep = self._normalize_import(m, dep)
				if dep in pname_to_node:
					mnode = pname_to_node[dep]
					curr_mnode.package_deps.append(mnode)
				elif dep in mname_to_node:
					mnode = mname_to_node[dep]
					curr_mnode.module_deps.append(mnode)
				else:
					# the dependency was never registered. this means that it
					# was a directly importing a method/class, so let's see if
					# we can't pull out the module containing said method/class
					
					# "package.module.SomeClass -> ["package.module", "SomeClass"]
					potential_module = dep.rsplit('.', 1)[0]

					if potential_module in mname_to_node:
						mnode = mname_to_node[potential_module]

						# check to make sure we haven't already added this module,
						# for example, package.module.Class1 and package.module.Class2
						# will both incorrectly try and add the same module
						if mnode not in curr_mnode.module_deps:
							curr_mnode.module_deps.append(mnode)

		# attempt to register each package as a child of its parent package
		for p in self._package_folders:
			curr_pnode = pname_to_node[p]
			self._register_parent_package(p, curr_pnode, pname_to_node, roots)
		
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
		elif root.expr_name == 'import_from':
			self._import_from(root, name)
		else:
			for child in root.children:
				self._traverse_tree(child, name)

	def _import_name(self, root, name):
		self._search_for_expr(root, 'dotted_name', self._dep_map[name])

	def _import_from(self, root, name):
		# "from foo.bar import baz" -> ["from", "foo.bar", "import", "baz"]
		from_package = root.text.split()[1]
		imports = []
		self._search_for_expr(root, 'import_as_name', imports)
		for imp in imports:
			split_arr = imp.split()
			if len(split_arr) == 3:
				# this import is in the form "module as m" -- so extract the module
				imp = split_arr[0]

			# note: the "module" we are adding to the dependency map may in fact
			# NOT be a real module -- it could be a method, or a class. but we
			# will strip this out later after we have processed all of the files and
			# can safely determine what is a real module and what isn't
			self._dep_map[name].append(from_package + '.' + imp)
	
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

		res = '.'.join(path_arr[:-i]) + '.' + name[i:]
		# print filepath, name, '-->', res
		return res

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