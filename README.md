# sonj-review / json-viewer
[![npm](https://img.shields.io/npm/dm/sonj-review?label=npm%20downloads)](https://www.npmjs.com/package/sonj-review)
[![npm version](https://img.shields.io/npm/v/sonj-review?color=blue)](https://www.npmjs.com/package/sonj-review)
![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/maxwroc/sonj-review/Pull%20Request%20Testing/master?label=tests)

Yet another json viewer lib. 

## Features

* View any size of JSON as long your browser can parse/load it
* Vanilla javascript (no additional libs required)
* Built-in plugins
  * [Auto expand](#auto-expand)
  * [Search](#search)
  * [Groups](#groups)
  * [Teaser](#teaser) (displaying number of elements/properties; specified property values)
  * [Truncate](#truncate)
  * [Actions menu](#actions-menu)
* Extensible
* Easy to adjust CSS

## Demo 

https://maxwroc.github.io/sonj-review/

## Initialization

```js
let plugins = [];
let jsonViewer = new SonjReview.JsonViewer(data, "NameOfTheRootNode", plugins);
jsonViewer.render("container-id");
```

## Plugins

Note: plugin order matters - please be aware of it when initializing the json viewer (use the order as listed above/below)

### Auto expand

By default JSON nodes are rendered collapsed. This plugin alows you to change it. You can specify depth for which nodes should be rendered open.

```js
// root node and it's children will be rendered open
const autoExpandPlugin = SonjReview.plugins.autoExpand(2);
```
![image](https://user-images.githubusercontent.com/8268674/124646232-4b986b80-de8c-11eb-822a-8bf9b038ebe6.png)

### Search 

Allows you to find a string in the JSON regardless if it is in the property name or value.

```js
const searchPlugin = SonjReview.plugins.search(
    data, {
        // whether to turn on/off case-sensitive search
        caseSensitive: false
    });

const searchInput = document.getElementById("search-box");
searchInput.addEventListener("keyup", evt => evt.keyCode == 13 && searchPlugin.query(searchInput.value));
```

### Groups

Limit the number of rendered child nodes. This way your browser won't stuck trying to render very big object. Properties or elements which won't be rendered are available in expandable groups.

```js
// limit number of rendered child nodes to 10 (and then group by 10)
const groupsPlugin = SonjReview.plugins.propertyGroups(10);
```

![image](https://user-images.githubusercontent.com/8268674/124648967-cd3dc880-de8f-11eb-9e76-4bc1478c5369.png)


### Teaser

Displays additional info next to the collapsed node. You can control whether the number of elements (in case of arrays) or properties (in case of objects) should be shown. You can specify as well property names which values should be shown.

```js
// root node and it's children will be rendered open
const teaserPlugin = SonjReview.plugins.propertyTeaser({ 
    properties: { 
        // list of the property names (their values will be shown whenever they exist)
        names: ["fname", "sname", "email"], 
        // limit of the number of properties to show 
        // (so you can specify longer prioritized list above but show only few of them found)
        maxCount: 2,
        // whether to print property name next to the value
        printNames: false,
        // max length of the single value
        maxValueLength: 20,
    },
    // max length of the total teaser length
    maxTotalLenght: 40,
    // whether to display counts (of array items or properties)
    showCounts: true,
}));;
```

![image](https://user-images.githubusercontent.com/8268674/124646420-869a9f00-de8c-11eb-9895-c60a9b0b1551.png)

### Truncate

If you know that your JSON may contain long values/strings this plugin will help you.

```js
const truncatePlugin = SonjReview.plugins.truncate({ 
    // max length for property name
    maxNameLength: 20,
    // max length for property value
    maxValueLength: 40,
    // whether to show full length info pill
    showLengthPill: true, 
    // whether to make info pill clickable (showing full, not truncated value)
    enableClickToExpand: true,
})
```

![image](https://user-images.githubusercontent.com/8268674/124651325-ae8d0100-de92-11eb-9e0c-f4c2402cbdac.png)


### Actions menu

Handy menu allowing you to do various actions. You can easily add your custom ones.

```js
// default menu items (copy name/value, copy formatted JSON)
const menuPlugin = SonjReview.plugins.propertyMenu();
```

![image](https://user-images.githubusercontent.com/8268674/124652129-a4b7cd80-de93-11eb-83a6-c4ae483ceb35.png)


#### Default menu items
* `copyName` - Copies property name to clippord
* `copyValue` - Copies property value to clipboard (in case of the object it converts it to JSON string)
* `copyFormattedValue` - Copies formatted JSON value (this option is available only for object value types) 

#### Converting JSON string to object - menu item

![image](https://user-images.githubusercontent.com/8268674/138968966-0dcdd245-caf1-4caa-943a-b5dda35b4f42.gif)

This menu item has to be added manually (it is not a part of the default menu items set). It appears only when value looks like a JSON object.

```typescript
const menuItems = SonjReview.plugins.propertyMenu.items;
const menuPlugin = SonjReview.plugins.propertyMenu([
    menuItems.parseJsonValue, // menu item for converting JSON strings
    menuItems.copyName,
    menuItems.copyValue,
]
```

#### Sort menu item

Sorts values (in case of arrays) or properties (in case of objects). Sorting twice does the reverse/descending sort.

This menu item has to be added manually.

```typescript
const menuItems = SonjReview.plugins.propertyMenu.items;
const menuPlugin = SonjReview.plugins.propertyMenu([
    menuItems.sortProperties, // sorting menu item
    menuItems.copyName,
    menuItems.copyValue,
]
```

#### Custom menu item definition example

```typescript
const copyFormattedValue: IPropertyMenuItem = {
    text: "Copy formatted JSON",
    isHidden: context => !context.node.isExpandable,
    onClick: context => {
        navigator.clipboard.writeText(
            context.node.isExpandable ? 
                JSON.stringify(context.node.data, null, 2) : 
                context.node.data);
    }
};
```
Initialization with custom menu item example

```js
const menuPlugin = SonjReview.plugins.propertyMenu([
    // using one of the default menu items
    SonjReview.plugins.propertyMenu.items.copyName,
    // your custom menu item
    myCustomMenuItem,
    // using one of the default menu items
    SonjReview.plugins.propertyMenu.items.copyFormattedValue,
]);
```

## CDN

* unpkg: [[sonj-review.min.js](https://unpkg.com/sonj-review/dist/sonj-review.min.js)]
* jsdelivr: [[sonj-review.min.js](https://cdn.jsdelivr.net/npm/sonj-review/dist/sonj-review.min.js)]

## Development

This component is still under development so please be aware that there might be breaking changes in the next releases!

## Feedback

Like it? **Star it!**

If something doesn't work or you have any suggestions how to improve it please create an issue on github.
