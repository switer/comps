# comps
[![npm version](https://badge.fury.io/js/comps.svg)](https://badge.fury.io/js/comps)
[![travis-ci](https://travis-ci.org/switer/comps.svg?branch=master)](https://travis-ci.org/switer/comps)

A Precompile and data-independent template engine for nodejs.

## Install
```bash
npm install comps --save
```

## Start up
Using with ejs, compile and render before **ejs** rendering.

```js
var comps = require('comps')
var ejs = require('ejs')
/**
 * Custom method for loading component's template file by id
 */
comps.componentLoader(function (name) {
    return fs.readFileSync(__dirname + '/c/' + name + '/' + name + '.tpl')
})
var tpl = comps({
    template: '<div>{% component $id="header" /%}</div>'
})
var html = ejs.render(tpl, data)
```

See [example](https://github.com/switer/vfe-init-server-side-render).

## Doc

- **[Class Methods](#class-methods)**
- **[Options](#options)**
- **[Using Pagelet](#using-pagelet)**
- **[Using Bigpipe](#using-bigpipe)**
- **[Reusable Template](#reusable-template)**
- **[Comps Tags](#comps-tags)**

## Class Methods

#### Comps(options)
- **Param**: options`<String>`, see [options](#options)
- **Return**: `<String>`

Render given template to string directly with options.

#### create()

Create Comps instance with isolated private variables.

```js
var Comps = require('comps').create()
Comps({
    // ...
})
```

#### config(name, value)
- **Param**: name`<String>`
- **Param**: value 
    
Rendering configuration setter. Supporting properties:
- **openTag** `<String>`
     Template syntax of open delimiter. Default *"{%"*.
- **closeTag** `<String>` 
    Template syntax of close delimiter.Default: *"%}"*

#### tag(name, def)
- **Param**: name`<String>`
    Tag name, using as `{% xxtag /%}` or `{% xxtag %}{%/ xxtag %}`

- **Param**: def`<Object>`
    Tag configuration. Supporting properties:

    - **scope** `<Boolean>`|`<Function>`  *Optional* 
        Whether create a child-scope for the tag.
        
    - **paired** `<Boolean>`  *Optional*
      Restrains the type of tag. if true, can't not using tag as self-closing. If false, the tag must be self-closing. Otherwise has not constraint.
        
    - **created** `<Function>` 
        Call when tag is created.
    
    - **outer** `<Function>` 
        Call when tag is rendered. Must **return** Array with two items, item1 is the open tag, item2 is the close tag. 

    - **inner** `<Function>` 
        Call when tag's child template is rendered. Must **return** String.

Context of defined method: 
    
- **$scope** `<Object>` 
    Scope of current context, properties will be herited to child-scope.
- **$el** `<Object>`
    AST node of the tag.
- **$raw** `<String>`
    Tag's raw content.
- **$name** `<String>`
    Tag name.
- **$attributes** `<Object>`
    All attributes of the tag.
- **$walk** `<Function>`
    AST traverse method, using to continue traverse childNodes of the tag.
- **$render** `<Function>`
    All attributes of the tag.

#### compile(tpl)
- **Param**: tpl`<String>`
    Compiled template as the same of options.template.
- **Return**: `<Function>`
    Render method.

Pre-render template and return render method that receive `options` as params.

#### bcompile(options)
- **Param**: options`<Object>`
    Template render options, see [options](#options)
- **Return**: `<Function>`
    Bigpipe factory function that will return bigpipe instance after calling

Pre-render template and return factory function that will be create a `bigpipe` instance after calling.

#### bigpipe(options)
- **Param**: options`<Object>`
    Template render options, see [options](#options)
- **Return**: `<Object>`
    Bigpipe instance. See [Using Bigpipe](#using-bigpipe)

Create a `bigpipe` instance directly.


#### componentLoader(loader)
- **Param**: loader`<Function>`

Custom component template file loader method. `loader` function will receive **id**`<String>` as param, **id** is the component id that given by tag's **$id** attribute. 
Loader should return object as result, and result must contains properties:`request`, `content`.

> Note: Only one loader work, it will overwrite last loader.

#### fileLoader(loader)
- **Param**: loader`<Function>`

Custom including template file loader method. `loader` function will receive **request**`<String>` and **context**`<String>`  as params. **request** is  **$path** attribute and **context** is the current directory path of the request. 
Loader should return object as result, and result must contains properties:`request`, `content`.

> Note: Only one loader work, it will overwrite last loader.

#### componentTransform(transform)
- **Param**: transform`<Function>`

Add call transform function before component tag rendering. `this` of transform point to tag instance and receive component **id**`<String>` as param.


## Using Pagelet

Configuration:
```js
var str = Comps({
    template: '...',
    pagelet: 'main.content'
})
```
Using pagelet in HTML template:
```html
<div class="main">
{% pagelet $id="main" %}
    <div class="content">
    {% pagelet $id="content" %}
        here is content.
    {% /pagelet %}
        out side.
    </div>
{% /pagelet %}
</div>
```

Render result:
```html
<div data-pageletid="main.content">
    here is content.
</div>
```
It will be wrapped with a pagelet tag default, set **$wrap** to `false` will disable wrapper.

## Using Bigpipe

Create bigpipe instance:
```js
var creator = Comps.bcompile({
    template: '...'
})
var bp = creator()
```
Using chunk in template:
```html
<div>header-{{title}}</div>
{% chunk $id="header" $require="title" /%}
<ul>...{{list}}...</ul>
{% chunk $id="list" $require="list" /%}
<div class="footer"></footer>
```
Listen events and handle data:
```js
bp.on('chunk', function (chunk) {
    res.write(template.render(chunk, this.data))
})
bp.on('end', function () {
    res.end()
})

// will emit "header" chunk
bp.set('title', 'xxx') 
setTimeout(function () {
    // will emit "list" chunk
    bp.set('list', [..])
})
```

Using multiple data at once:
```js
bp.set({
    title: 'xxx',
    list: []
})
```

Using endChunk() end up dependence waiting of the chunk:
```js
bp.endChunk('header')
bp.endChunk('list')
```

Using flush() to check and write chunk when set data directly:
```js
bp.data.title = ''
bp.data.list = []
bp.flush()
```

End `bigpipe` manually, it flush remain chunks immediately but ignore waiting dependences: 
```js
bp.end()
```

## Reusable Template
Assume a component template `./index.tpl` as below:
```html
<div class="index">
    {% pagelet $id="list" %}
    <ul class="list">
        <li>item</li>
    </ul>
    {% /pagelet %}
</div>
```
If you need do client-side render and reuse the template in some case,  you can use [comps-loader](https://github.com/switer/comps-loader) .
> Note: "comps-loader" is  comps's template loader  for webpack, and you need do some configuration when use it. See [detail](https://github.com/switer/comps-loader#usage)

Load template in client-side when using comps-loader:
```js
// load full template file
var tpl = require('./index.tpl')
// load pagelet of template
var pagelet = require('!!comps!./index.tpl?pagelet=list')
```
Pagelet result =>
```html
<ul class="list">
    <li>item</li>
</ul>
```

If you don't like `require('!!comps!./index.tpl?pagelet=list')`, you can create an independ file for list template:
`./index.tpl`
```html
<div class="index">
    {% include $path="./list.tpl" /%}
</div>
```
`./list.tpl`:
```html
<ul class="list">
    <li>item</li>
</ul>
```

Load templates:
```js
// load full template file
var tpl = require('./index.tpl')
// load list template
var pagelet = require('./index.tpl')
```


## Options
Options of rendering template with `comps(options)`:

#### template 
- Type: `<String>`

HTML template for rendering.

#### pagelet 
- Type: `<String>` 
- *Optional*

Render those template including in pagelet tag. It compare `pagelet` option with pagelet tag's `$id`.
See [Using pagelet](#using-pagelet).

#### chunk 
- Type: `<Boolean>` 
- *Optional*

> Note: Chunk is enable default in `bigpipe` rendering.  

If chunk is true, `Comps` will render Chunk tag to `CHUNK_SPLITER`, such as:  `<!--{% chunk /%}-->`.
See [Using Bigpipe](#using-bigpipe).

#### context
- Type: `<String>` 
- *Optional*

> Note: Using with `include` tag.

Specify current directory path of the given template.

## Comps Tags
All build-in available tag of comps.

### component
Component tag is using to load and handle component template file

**Example**:
```html
{% component $id="header" /%}
```
It will call `componentLoader` to loader component file by id "header".

**Tag attributes**:
- **$id**            Id name of the component for load component file.
- **$tag**          Specify tag name of component wrapper tag. *Optional*
- **$replace**   Using component wrapper tag of not, default `false`. Set to "`nomerge`" will not copy attributes to template container element, otherwise all attribute from the component tag will copy to template container element and overwrite exist attribute.*Optional* 

**Events***

- **componentcreated(tagInstance)**
- **beforecomponentload(id, tagInstance)**
- **componentloaded(id, tagInstance, result)**
        
        After load, will get request/context of the component in "tagInstance", changing will change render result.


### pagelet
Pagelet tag is using to render template only that  included in pagelet if `pagelet` option is given. 

**Example**:
```html
{% pagelet $id="header" $wrap=false %}
    <div class="header"></div>
{%/ pagelet %}
```
If pagelet of rendering options is "header", it will render the template included in pagelet tag only.

**Attributes**:
- **$id**           Id name of the pagelet for matching.
- **$tag**          Specify tag name of pagelet wrapper tag. *Optional*
- **$wrap**         Using pagelet wrapper tag of not, default `false`. *Optional*

### include 
Inline another HTML template file into current template.

**Example**:
```html
{% include $path="./header.tpl" /%}
```

**Attributes**:
- **$path** File path, can be relative or absolute.

**Events**
- **beforefileload(request, context, tagInstance)**
- **fileloaded(result, tagInstance)**
        
        After load, will get request/context of the file in "tagInstance", changing will change render result.

### chunk 
Bigpipe chunk split tag, and declare data dependences of above chunk.

### output(>)
Execute expression and output data that given by component.

Declare data in component tag:
```html
{% component $id="main" $data="title: 'Output ag', content: 'Data from components' " /%}
```

Templte of `"main"` component:
```html
<div>
    {%> 'Title is: ' + title /%}
    {%> 'Content is: ' + content /%}
</div>
```
Render result:
```html
<div>
    Title is: Output tag
    Content is: Data from components
</div>
```

**Example**:
```html
...
<div class="header">...</div>
{% chunk $require="title,name" /%}
<div class="footer">...</div>
...
```
`chunk` event will be emitted if require dependences are done.

**Attributes**:
- **$require** Require dependences, multiple keys splited by  "`,`" .
