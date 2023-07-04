const path = require('path');

module.exports = {
    // production、development
    mode: 'production',
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, '../../../whats-robot/js'),
        filename: 'popup.js',
    },
};