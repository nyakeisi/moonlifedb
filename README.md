# MoonlifeDB: a new way to work with databases.

A better version of `ls-jsondb` by me <br />
Huge thanks to Phntasm for helping <br />

## What's new?

Version: **1.0.0 ALPHA 8** <br />
+ Some minor fixes <br />

See the main documentation down below. <br />

## Documentation

Full documentation will be released later. <br />
If you need help, you can contact me: Sleeping Foxxo#0001 <br /> <br />

How to import: <br />

### SimpleDatabase

```js
// old javascript
const { SimpleDatabase, LocalStorage } = require("moonlifedb");
const adapter = new LocalStorage({ path: "YOURDIRECTORYHERE" });
const db = new SimpleDatabase(adapter);
```

```ts
// new javascript and typescript
import { SimpleDatabase, LocalStorage } from "moonlifedb";
const adapter = new LocalStorage({ path: "YOURDIRECTORYHERE" });
const db = new SimpleDatabase(adapter);
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
