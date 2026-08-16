"""S4Biz corporate site backend.

`app` is a PACKAGE. Use relative imports inside it (`from . import notify`). A bare
`import notify` resolves during local development and fails at runtime inside the container, and
because most call sites here are wrapped in a tolerant try/except, that failure would be silent.
"""
