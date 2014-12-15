from abc import ABCMeta, abstractmethod
from collections import Counter

from parsimonious.grammar import Grammar, NodeVisitor


class Node(dict, metaclass=ABCMeta):
	def __init__(self, name):
		super().__init__()
		self.__dict__ = self
		self.name = name

	def __repr__(self):
		return self.name

	def __hash__(self):
		return hash(self.name)

	def __eq__(self, other):
		return self.name == other.name and self._equal_children(other)

	@abstractmethod
	def _equal_children(self, other):
		return True


class PackageNode(Node):
	def __init__(self, name):
		super().__init__(name)
		self.sub_packages = []
		self.sub_modules = []
		self.type = 'package' # for json conversion

	def _equal_children(self, other):
		return (Counter(self.sub_packages) == Counter(other.sub_packages) and
				Counter(self.sub_modules) == Counter(other.sub_modules))

	@staticmethod
	def from_dict(dict_):
		pnode = PackageNode(dict_['name'])
		pnode.sub_packages = list(map(PackageNode.from_dict, dict_['sub_packages']))
		pnode.sub_modules = list(map(ModuleNode.from_dict, dict_['sub_modules']))
		return pnode


class ModuleNode(Node):
	def __init__(self, name):
		super().__init__(name)
		self.package_deps = []
		self.module_deps = []
		self.type = 'module' # for json conversion

	def _equal_children(self, other):
		return (Counter(self.package_deps) == Counter(other.package_deps) and
				Counter(self.module_deps) == Counter(other.module_deps))

	@staticmethod
	def from_dict(dict_):
		mnode = ModuleNode(dict_['name'])
		mnode.package_deps = list(map(PackageNode.from_dict, dict_['package_deps']))
		mnode.module_deps = list(map(ModuleNode.from_dict, dict_['module_deps']))
		return mnode


class Codebase(metaclass=ABCMeta):
	def __init__(self, peg_file):
		with open(peg_file) as peg_fh:
			self._grammar = Grammar(peg_fh.read())

	@abstractmethod
	def register(self, filepath, contents):
		""" Given input program (full path + contents), parse its dependencies 
		and add them to the current project state. Will only process a file
		if its extension matches the project language (e.g. PythonProject -> '.py')
		"""
		return

	@abstractmethod
	def build_dependency_tree(self):
		""" Signals that all files in the codebase have had their dependencies registered,
		and compiles together the results of all the files that have been added. Returns
		a list of tree roots, containing a potential mix of PackageNodes/ModuleNodes.
		"""
		return