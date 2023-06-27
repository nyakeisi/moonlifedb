# MoonlifeDB: a new way to work with databases.

A better version of `ls-jsondb` by me <br />
Huge thanks to Phntasm for helping <br />

```npm i moonlifedb```

## Requirements

+ TypeScript: i use 5.1.3, but you can use older versions (tested with 4.7+) <br />
+ lodash: i use 4.17.21 <br />
+ fs <br />

## What's new?

Version: **1.0.0 ALPHA 9B** <br />
+ Fixed Database#check() method. Now it returns boolean value as it should.<br />
+ SimpleDatabase is now marked as Deprecated.<br />
+ Moved to class Database. Completely redone methods and now they are faster and easier to use.<br />
+ Database#write() is now deprecated. Use Database#create() instead.<br />
+ Added Snowflake#decode(). Now you can decode your snowflake.<br />
+ Fixed tooltips: grammar and minor variable mistakes.<br />
+ Currently working on new documentation. You will be able to see it in future updates.<br /><br />

See the main documentation down below. <br />

## Documentation

Full documentation will be released later. <br />
If you need help or you want to help with development,<br />
you can contact me: @uwu.fox on Discord or @squlissa on Twitter<br /> <br />

How to import: <br />

### Database

```js
// old javascript
const { Database, LocalStorage } = require("moonlifedb");
const adapter = new LocalStorage({ path: "YOURDIRECTORYHERE" });
const db = new Database(adapter);
```

```ts
// new javascript and typescript
import { Database, LocalStorage } from "moonlifedb";
const adapter = new LocalStorage({ path: "YOURDIRECTORYHERE" });
const db = new Database(adapter);
```

### SnowFlake

```js
// old javascript
const { Snowflake } = require("moonlifedb");
const snowflake = new SnowFlake(
    {
        worker: 1,
        epoch: 1672531200000 // example: January 1st 2023 12:00 AM
    }
);
```

```ts
// new javascript and typescript
import { SnowFlake } from "moonlifedb";
const snowflake = new SnowFlake(
    {
        worker: 1,
        epoch: 1672531200000 // example: January 1st 2023 12:00 AM
    }
);
```

### Table

```js
// old javascript
const { CosmeticConstructor } = require("moonlifedb");
const table = new CosmeticConstructor();
```

```ts
// new javascript and typescript
import { CosmeticConstructor } from "moonlifedb";
const table = new CosmeticConstructor();
```

### Token

```js
// old javascript
const { Token } = require("moonlifedb");
const table = new Token();
```

```ts
// new javascript and typescript
import { Token } from "moonlifedb";
const table = new Token();
```

### Formatter

```js
// old javascript
const { JSONFormatter } = require("moonlifedb");
const formatter = new JSONFormatter({ whitespace: '\t' });
```

```ts
// new javascript and typescript
import { JSONFormatter } from "moonlifedb";
const formatter = new JSONFormatter({ whitespace: '\t' });
```
