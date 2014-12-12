import abc
from collections import Counter

from parsimonious.grammar import Grammar, NodeVisitor

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


class Codebase(object, metaclass=abc.ABCMeta):
	def __init__(self, peg_file):
		with open(peg_file) as peg_fh:
			self._grammar = Grammar(peg_fh.read())

	@abc.abstractmethod
	def register(self, filepath, contents):
		""" Given input program (full path + contents), parse its dependencies 
		and add them to the current project state. Will only process a file
		if its extension matches the project language (e.g. PythonProject -> '.py')
		"""
		return

	@abc.abstractmethod
	def build_dependency_tree(self):
		""" Signals that all files in the codebase have had their dependencies registered,
		and compiles together the results of all the files that have been added. Returns
		a list of tree roots, containing a potential mix of PackageNodes/ModuleNodes.
		"""
		return