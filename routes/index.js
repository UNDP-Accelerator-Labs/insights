if (!exports.api) { exports.api = {} }
if (!exports.home) { exports.home = {} }
if (!exports.browse) { exports.browse = {} }

exports.home.index = require('./home')
exports.home.browse = require('./browse')

exports.browse.toolkit = require('./toolkit')