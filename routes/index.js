if (!exports.api) { exports.api = {} }
if (!exports.home) { exports.home = {} }
if (!exports.browse) { exports.browse = {} }
if (!exports.nlp_api) { exports.nlp_api = {}}

const { DB } = include('db/')

exports.home.index = require('./home')
exports.home.browse = require('./browse')
exports.browse.toolkit = require('./toolkit')

exports.nlp_api.nlp_browse = require('./nlp').nlp_browse
exports.nlp_api.nlp_stats = require('./nlp').nlp_stats;
