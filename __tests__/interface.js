const plugin = require('../plugin')

test('has the right interface', async () => {
  expect(typeof plugin.add).toBe('function')
  expect(typeof plugin.remove).toBe('function')
})
