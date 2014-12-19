import unittest
import json

from core.codebase import Codebase, PackageNode, ModuleNode


class TestCodebase(unittest.TestCase):
	
	def test_to_json(self):
		p1 = PackageNode('p1')
		m1 = ModuleNode('m1')
		m2 = ModuleNode('m2')

		p1.children = [m1, m2]
		p1.parents = []
		m1.children = [m2]
		m1.parents = [p1]
		m2.parents = [m1, p1]

		roots = [p1]

		dct = {	
			id(p1): {
				'name': 'p1',
				'type': 'package',
				'children': [id(m1), id(m2)],
				'parents': []
			},
			id(m1): {
				'name': 'm1',
				'type': 'module',
				'children': [id(m2)],
				'parents': [id(p1)]
			},
			id(m2): {
				'name': 'm2',
				'type': 'module',
				'children': [],
				'parents': [id(m1), id(p1)]
			}
		}

		expected_json = json.dumps(dct, sort_keys=True)
		self.assertEqual(expected_json, Codebase.to_json(roots, sort_keys=True))