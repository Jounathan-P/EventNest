const path = require('path')

module.exports = {
    mode: 'development',
    entry: '/src/index.js',
    output: {
        path: path.resolve(__dirname, 'EventNest/dist'),
        filename: 'bundle.js'
    },
    watch: true
}