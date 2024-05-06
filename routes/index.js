if (!exports.api) { exports.api = {} }
if (!exports.home) { exports.home = {} }
if (!exports.browse) { exports.browse = {} }
if (!exports.nlp_api) { exports.nlp_api = {}}
if (!exports.blogs) { exports.blogs = {}}
if (!exports.err) { exports.err = {}}
if(!exports.service) { exports.service = {}}
if(!exports.platform) { exports.platform = {}}

exports.service.authenticate = require('./nlp').authenticate

exports.home.index = require('./home')
exports.home.browse = require('./browse')
exports.browse.toolkit = require('./toolkit')

exports.nlp_api.nlp_browse = require('./nlp').nlp_browse
exports.nlp_api.nlp_stats = require('./nlp').nlp_stats;
exports.nlp_api.document_metadata = require('./nlp').document_metadata;

exports.blogs.browse = require('./blogs');
exports.blogs.get_webpage_content = require('./blogs/scapper');

exports.platform.api = require('./platforms');

exports.err.err404 = require('./error').err404
exports.err.err500 = require('./error').err500;
