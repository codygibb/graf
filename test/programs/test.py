import foo
from foo import *
import foo.bar.baz
from foo import bar, baz
from foo import bar
"""
from BAD import VERYBAD
fjdk
fjkdsajldkfjsalfdjka
"""

''' blah blah lbah '''

for i in range(0, 10):
    from_ = i
    import_ = bar
from_foo = 5
import_bar = 6
def from_foo_import_bar():
    print('from foo import bar')
    print('import foo')
    i = 5 # from foo import bar
    j = 6 # import baz
    print("from foo import bar")
    print("import foo")
