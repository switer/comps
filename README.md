# comps
An components template language in server side render.

## Usage

Install
```bash
npm i comps --save
```

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

render()
```

## Render Options

#### template 
    - Type: `<String>`

    HTML template.

#### pagelet 
    - Type `<String>` 
    - Optional

    Render the pagelet tag and it's child only when pagelet option is given. Match with pagelet's `$id` attribute.

## Methods

#### config(conf)
    Property of `conf`:

    **openTag**
        - Type: `<String>`
        - Defaylt: "{%"

        Template syntax of open-tag.

    **closeTag** 
        - Type: `<String>` 
        - Default: "%}"

        Template syntax of close-tag.

#### tag(name, def)

    **name** 
        - Type: `<String>`

        Tag name, using as "{% xxtag /%}" or "{% xxtag %}{%/ xxtag %}"

    **def** 
        - Type: `<Object>`

        Tag configuration. Options:

            - scope `<Boolean>`  
                Whether create a child-scope for the tag.

            - block `<Boolean>`  
                Whether block tag. Such as: "{%tag%}{%/tag%}".

            - created `<Function>` 
                Call when tag is created.

            - render `<Function>` 
                Call when tag is rendered. Must **return** Array with two items, item1 is the open tag, item2 is the close tag. 

            - walk `<Function>` 
                Call when tag's child template is rendered. Must **return** String.

#### compile(tpl)

    **tpl** 
        - Type: `<String>`

        preRender template

    *return*
        - Type: `<Function>`

#### componentLoader(loader)

    **loader**
        - Type: `<Function>`

#### componentTransform(transform)

    **transform**
        - Type: `<Function>`

## Tags

#### component

***Example**:
```html
{% component $id="header" /%}
```

**Attributes**:
    - $id
    - $tag
    - $replace

#### pagelet

**Example**:
```html
{% pagelet $id="header" $wrap=false /%}
    <div class="header"></div>
{%/ pagelet %}
```

**Attributes**:
    - $id
    - $tag
    - $wrap