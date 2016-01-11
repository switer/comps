# comps
[![npm version](https://badge.fury.io/js/comps.svg)](https://badge.fury.io/js/comps)
[![travis-ci](https://travis-ci.org/switer/comps)](https://travis-ci.org/switer/comps.svg?branch=master)

A components template language of node.js.



## Install
```bash
npm install comps --save
```

## Start up
Using in server-side render before data template engine render.

```js
var comps = require('comps')
/**
 * Custom compoment file loader
 */
comps.componentLoader(function (name) {
    return fs.readFileSync(__dirname + '/c/' + name + '/' + name + '.tpl')
})
var tpl = '<div>{% component $id="header" /%}</div>'
comps({
    template: tpl
})
/** 
 * Optimize
 */
var render = comps.compile(tpl)
/**
 * Output render string
 */
render()
```

## Doc

- **[Class Methods](#class-methods)**
- **[Options](#options)**
- **[Using Pagelet](#using-pagelet)**
- **[Using Bigpipe](#using-bigpipe)**
- **[Comps Tags](#comps-tags)**

## Class Methods

#### Comps(options)
- **Param**: options`<String>`, see [options](#options)
- **Return**: `<String>`

Render given template to string directly with options.

#### config(name, value)
- **Param**: name`<String>`
- **Param**: value 
    
Set render config of Comps. Support properties:
- **openTag** `<String>`
     Template syntax of open delimiter. Default *"{%"*.
- **closeTag** `<String>` 
    Template syntax of close delimiter.Default: *"%}"*

#### tag(name, def)
- **Param**: name`<String>`
    Tag name, using as `{% xxtag /%}` or `{% xxtag %}{%/ xxtag %}`

- **Param**: def`<Object>`
    Tag configuration. Support properties:

    - **scope** `<Boolean>`|`<Function>`  *Optional* 
        Whether create a child-scope for the tag.
        
    - **block** `<Boolean>`  *Optional*
      Restrains the type of tag. if true, can't not using tag as self-closing. If false, the tag must self-closing. Otherwise has not constraint.
        
    - **created** `<Function>` 
        Call when tag is created.
    
    - **outer** `<Function>` 
        Call when tag is rendered. Must **return** Array with two items, item1 is the open tag, item2 is the close tag. 

    - **inner** `<Function>` 
        Call when tag's child template is rendered. Must **return** String.

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

Pre-render template and return factory function that will be create a `bigpipe` instance after calling.

#### bigpipe(options)
- **Param**: options`<Object>`
    Template render options, see [options](#options)
- **Return**: `<Object>`

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

## Options
Options of rendering template with `comps(options)`:

#### template 
- Type: `<String>`

HTML template for rendering.

#### pagelet 
- Type: `<String>` 
- *Optional*

Render those template including in pagelet tag. It compare `pagelet` option with pagelet tag's `$id`.

#### chunk 
- Type: `<Boolean>` 
- *Optional*

> Note: Chunk is enable default in `bigpipe` rendering.  

If chunk is true, `Comps` will render Chunk tag to `CHUNK_SPLITER`, such as:  `<!--{% chunk /%}-->`.

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
- **$replace**   Using component wrapper tag of not, default `true`. Set to "`nomerge`" will not copy attributes to template container element, otherwise all attribute from the component tag will copy to template container element and overwrite exist attribute.*Optional* 

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
- **$tag**         Specify tag name of pagelet wrapper tag. *Optional*
- **$wrap**      Using pagelet wrapper tag of not, default `true`. *Optional*

### include 
Inline another HTML template file into current template.

**Example**:
```html
{% include $path="./header.tpl" /%}
```

**Attributes**:
- **$path** File path, can be relative or absolute.

### chunk 
Bigpipe chunk split tag, and declare data dependences of above chunk.

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
