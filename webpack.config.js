const path = require('path')

module.exports = {
    entry: './workers/index.ts',
    output: {
        filename: 'script.js',
        path: path.join(__dirname, 'dist')
    },
    devtool: 'cheap-module-source-map',
    mode: 'development',
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    }
}
