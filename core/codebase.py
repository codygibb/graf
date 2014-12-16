from abc import ABCMeta, abstractmethod
from collections import Counter
import json

from parsimonious.grammar import Grammar, NodeVisitor


class Codebase(metaclass=ABCMeta):
	""" Codebase is an abstract class that represents an entire project. Specific
	language projects extend Codebase and implement the register and build_dependency_tree
	methods.
	"""

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

	@classmethod
	def to_json(cls, roots, sort_keys=False):
		res_dict = {}

		def traverse(node):
			if id(node) not in res_dict:
				res_dict[id(node)] = node.get_dict()
				for c in node.children:
					traverse(c)

		for r in roots:
			traverse(r)

		return json.dumps(res_dict, sort_keys=sort_keys)


class Node:
	""" Represents a node of a project's depedency tree. """

	def __init__(self, name, type_):
		self.name = name
		self.type = type_
		self.children = []

	def get_dict(self):
		""" Returns a dictionary representation of the node, with the node's
		children represented as a list of object ids. Used for converting node to json.
		"""
		res_dict = {'name': self.name, 'type': self.type}
		res_dict['children'] = list(map(lambda x: id(x), self.children))
		return res_dict

	def __repr__(self):
		return self.name

	def __hash__(self):
		return (hash(self.name) * 31) ^ hash(self.type)

	def __eq__(self, other):
		return (self.name == other.name and self.type == other.type and
				Counter(self.children) == Counter(other.children))


class PackageNode(Node):
	""" Wrapper for a node identified as a package """

	def __init__(self, name):
		super().__init__(name, 'package')


class ModuleNode(Node):
	""" Wrapper for a node identified as a module """

	def __init__(self, name):
		super().__init__(name, 'module')