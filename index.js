const scope = require('./scope');
const tokenizer = require('./tokenizer.js');
const Render = require('./render.js');
const lexical = require('./lexical.js');
const path = require("path");
const fs = require('fs');
const Tag = require('./tag.js');
const Filter = require('./filter.js');
const error = require('./error.js');
const Template = require('./template');
const Expression = require('./expression.js');

const tagsPath = path.join(__dirname, "tags");

var _engine = {
    registerFilter : function(name, filter){
        return this.filter.register(name, filter);
    },
    registerTag : function(name, tag){
        return this.tag.register(name, tag);
    } 
};

function factory(){
    var engine = Object.create(_engine);

    engine.tag = Tag();
    engine.filter = Filter();
    engine.tokenize = tokenizer.parse;

    engine.template = Template(engine.tag, engine.filter);
    engine.parseStream = engine.template.parseStream;

    var renderer = Render(engine.filter, engine.tag);
    engine.renderTemplates = renderer.renderTemplates;

    engine.render = function(html, ctx) {
        var tokens = engine.tokenize(html);
        var templates = engine.template.parse(tokens);
        engine.register = {};
        return engine.renderTemplates(templates, scope.factory(ctx));
    };
    engine.evalOutput = function(str, scope) {
        var template = engine.template.parseOutput(str.trim());
        return renderer.evalOutput(template, scope);
    };

    fs.readdirSync(tagsPath).map(function(f){
        var match = /^(\w+)\.js$/.exec(f);
        if(!match) return;
        require("./tags/" + f)(engine);
    });
    require("./filters.js")(engine);
    return engine;
}

factory.lexical = lexical;
factory.error = error;
factory.isTruthy = Expression.isTruthy;
factory.isFalsy = Expression.isFalsy;
factory.stringify = Render.stringify;
factory.evalExp = Expression.evalExp;
factory.evalValue = Expression.evalValue;


module.exports = factory;
