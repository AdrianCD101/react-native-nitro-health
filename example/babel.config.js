const path = require('path')
const pak = require('../package.json')

module.exports = (api) => {
  api.cache(true)
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          // .ts/.tsx before .js so stray compiled artifacts can never shadow sources
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            [`^${pak.name}$`]: path.join(__dirname, '../', pak.source),
          },
        },
      ],
    ],
  }
}
