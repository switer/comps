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

- **template** `<String>`

    HTML template.

- **pagelet** `<String>` Optional

    Render the pagelet tag and it's child only when pagelet option is given. Match with pagelet's `$id` attribute.

## API

- **.config(conf)**

    * openTag `<String>`

        Open-tag token, such as "{%"

    * closeTag `<String>` 

        Close-tag token, such as "%}"

- **.tag(name, def)**

    * name `<String>`

        Tag name, using as "{% xxtag /%}" or "{% xxtag %}{%/ xxtag %}"

    * def `<Object>`

        Tag configuration. Options:

        - scope   `<Boolean>`  
            Whether create a child-scope for the tag.

        - block   `<Boolean>`  
            Whether block tag. Such as: "{%tag%}{%/tag%}".

        - created `<Function>` 
            Call when tag is created.

        - render  `<Function>` 
            Call when tag is rendered. Must **return** Array with two items, item1 is the open tag, item2 is the close tag. 

        - walk    `<Function>` 
            Call when tag's child template is rendered. Must **return** String.

- **.compile(tpl)**

    * tpl `<String>`

        preRender template

    * return `<Function>`

- **.componentLoader(loader)**

- **.componentTransform(transform)**

## Tags

- **component**

Example:
```html
{% component $id="header" /%}
```

Attributes:

    - $id
    - $tag
    - $replace

- **pagelet**

Example:
```html
{% pagelet $id="header" $wrap=false /%}
    <div class="header"></div>
{%/ pagelet %}
```

Attributes:

- $id
- $tag
- $wrap