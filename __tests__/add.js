const sinon = require('sinon')
const plugin = require('../plugin')

test('adds the proper npm module and component example', async () => {
  // spy on few things so we know they're called
  const addModule = sinon.spy()
  const addPluginComponentExample = sinon.spy()

  // mock a context
  const context = {
    ignite: { addModule, addPluginComponentExample }
  }

  await plugin.add(context)

  expect(addModule.calledWith('react-native-navigation', {version: '2.0.2362', link: true})).toBe()
})
