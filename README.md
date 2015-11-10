# comps
An components template language in server side render.

## Usage

Install
```bash
npm i comps --save
```

```js
var comps = require('comps')
comps.componentLoader(function (name) {
    return fs.readFileSync(__dirname + '/c/' + name + '/' + name + '.tpl')
})
comps({
    template: '<div>{% component $id="header" /%}</div>'
})
```


## Apis

- **config**
- **tag**
- **componentLoader**
- **componentTransform**

## Tags

- **component**
Example:

```html
{% component $id="header" /%}
```

- **pagelet**