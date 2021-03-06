import os
from collections import Counter

from core.codebase import Codebase, PackageNode, ModuleNode


class PythonProject(Codebase):
	""" A python project is defined by having folder packages, with __init__.py defining
	when a folder is indeed a package. Within a particular folder/package, there can be
	multiple .py files. Any other python file can import the entire package, or just
	a piece of the package (or in fact a piece of a piece of the package). 
	
	Example project:

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
	"""
	def __init__(self):
		super().__init__('python')

		# _package_folders will keep track of all packages that have been registered
		self._packages = set()
		# _dep_map will keep track of all modules that have been registered and map them 
		# their dependencies
		self._dep_map = {}

	# make sure to call this method on '__init__.py' to register a package!
	def register(self, filepath, contents):
		splitext = os.path.splitext(filepath)
		if os.path.basename(filepath) == '__init__.py':
			folder = os.path.dirname(filepath).replace('/', '.')
			self._packages.add(folder)
			# print 'folder:', folder
		elif splitext[1] == '.py':
			name = splitext[0].replace('/', '.')
			self._dep_map[name] = []
			root = self._grammar.parse(contents)
			self._traverse_tree(root, name)

	def build_dependency_tree(self):
		# preprocess modules/packages nodes -- map the string name to the node object
		package_lookup = {}
		for p in self._packages:
			package_lookup[p] = PackageNode(self._get_basename(p))
		module_lookup = {}
		for m in self._dep_map:
			module_lookup[m] = ModuleNode(self._get_basename(m))

		for m in self._dep_map:
			curr_mnode = module_lookup[m]
			
			self._register_parent_package(m, curr_mnode, package_lookup)

			# go through the dependecies of the current module, and link each
			# to the appropriate package/module node object
			for dep in self._dep_map[m]:
				dep = self._normalize_import(m, dep)
				child = None
				if dep in package_lookup:
					child = package_lookup[dep]
				elif dep in module_lookup:
					child = module_lookup[dep]
				else:
					# the dependency was never registered. this means that it
					# was a directly importing a method/class, so let's see if
					# we can't pull out the module containing said method/class
					
					# "package.module.SomeClass -> ["package.module", "SomeClass"]
					potential_module = dep.rsplit('.', 1)[0]

					if potential_module in module_lookup:
						mnode = module_lookup[potential_module]

						# check to make sure we haven't already added this module,
						# for example, package.module.Class1 and package.module.Class2
						# will both incorrectly try and add the same module
						if mnode not in curr_mnode.children:
							child = mnode
				
				if child:
					# we successfully found a dependency! add a two-way edge
					curr_mnode.children.append(child)
					child.parents.append(curr_mnode)

		# attempt to register each package as a child of its parent package
		for p in self._packages:
			self._register_parent_package(p, package_lookup[p], package_lookup)

		return self._find_roots(package_lookup, module_lookup)

	# PRIVATE HELPER METHODS
	
	def _find_roots(self, package_lookup, module_lookup):
		""" Given a dictionaries of string name to node object, returns a list
		of all the root nodes of the tree.
		"""
		roots = []

		def add_roots(lookup):
			for name in lookup:
				node = lookup[name]
				if not node.parents:
					roots.append(node)

		add_roots(package_lookup)
		add_roots(module_lookup)

		return roots
	
	def _get_basename(self, name):
		split = name.rsplit('.', 1)
		try:
			return split[1]
		except:
			return split[0]
	
	def _register_parent_package(self, name, node, package_lookup):
		""" Register the given package/module name with corresponding PackageNode/ModuleNode
		as a child of its parent package (using the package_lookup dictionary to lookup a
		package string to the corresponding PackageNode).
		"""
		split = name.rsplit('.', 1)
		if len(split) > 1:
			# this package/module has a parent, process accordingly
			parent_package = split[0]
			try:
				pnode = package_lookup[parent_package]
				pnode.children.append(node)
				node.parents.append(pnode)
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
			if from_package[-1] == '.':
				# this is a relative import, so don't separate with dot
				self._dep_map[name].append(from_package + imp)
			else:
				self._dep_map[name].append(from_package + '.' + imp)

	def _normalize_import(self, module_path, name):
		""" Convert a relative import to the full path of the module/package being imported
		module_path -> dotted path of module. ex: "my_project.packageA.module1"
		name     -> name of module/package being imported w/ relative dotted name.
					ex: ".module2", or "..packageB.module3"
		"""
		if name[0] != '.':
			# name isn't a relative path, so just skip it
			return name

		path_arr = module_path.split('.')
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