# MoonlifeDB: A simple JSON database
>Version: **1.0.0 ALPHA 10-PRE1** <br />

If you need help or you want to help with development,<br />
you can contact the main developer: **uwu.fox** on Discord or **squlissa** on Twitter<br />
```bash
npm i moonlifedb@latest
```
Source code: [MoonlifeDB on GitHub](https://github.com/nyakeisi/moonlifedb/tree/main)<br />
*(You can also report bugs here!)*
+ TypeScript: We use 5.1.3, but you can use older versions (tested with 4.7+) <br />
+ lodash: We use 4.17.21 (not tested with older or newer versions) <br />

- [MoonlifeDB: A simple JSON database](#moonlifedb-a-simple-json-database)
- [How to use the database?](#how-to-use-the-database)
  - [How to start working with Database?](#how-to-start-working-with-database)
    - [Installing and importing](#installing-and-importing)
    - [Create your first table!](#create-your-first-table)
  - [How to work with Database?](#how-to-work-with-database)
    - [Write](#write)
    - [Read](#read)
    - [Edit](#edit)
    - [Check](#check)
  - [How about asynchronous?](#how-about-asynchronous)
  - [What are pointers?](#what-are-pointers)
    - [Dot pointer](#dot-pointer)
    - [Tilde pointer](#tilde-pointer)
  - [Can I listen to these events?](#can-i-listen-to-these-events)
    - [EventManager](#eventmanager)
    - [Event constructor](#event-constructor)
- [Documentation](#documentation)
  - [Database](#database)
    - [Database Constructor](#database-constructor)
    - [Database#create()](#databasecreate)
    - [Database#edit()](#databaseedit)
    - [Database#remove()](#databaseremove)
    - [Database#read()](#databaseread)
    - [Database#check()](#databasecheck)
    - [Database#checkres()](#databasecheckres)
  - [LocalStorage](#localstorage)
    - [LocalStorage Constructor](#localstorage-constructor)
  - [JSONFormatter](#jsonformatter)
    - [JSONFormatter Constructor](#jsonformatter-constructor)
  - [Event](#event)
    - [Event Constructor](#event-constructor-1)
  - [EventManager](#eventmanager-1)
    - [EventManager Constructor](#eventmanager-constructor)
    - [EventManager#on()](#eventmanageron)
  - [Snowflake](#snowflake)
    - [Snowflake Constructor](#snowflake-constructor)
    - [Snowflake#generate()](#snowflakegenerate)
    - [Snowflake#generateRaw()](#snowflakegenerateraw)
    - [Snowflake#decode()](#snowflakedecode)


# How to use the database?

**WARNING:** The database is currently in **alpha** state. It means there are still a lot of functions missing. When we release it in **beta**, it will be mostly safe to use.<br />
**WARNING 2:** Main Database class is mostly done, but in Alpha 9 we redone it completely and we are still testing it, so use at your own risk!<br />

## How to start working with Database?
### Installing and importing
First of all you need to install it. You can run this command:
```
npm i moonlifedb@latest
```
After it got installed you need to import it. You can do it like that:
```js
import { Database, LocalStorage } from 'moonlifedb';
```
Or like that:
```js
const { Database, LocalStorage } = require('moonlifedb');
```
You just imported the class and now we have to call the construction. You can do it like that:
```js
const adapter = new LocalStorage({ path: 'path' }) // Note #1
const db = new Database(adapter)
```
***Note #1**: path is an exact path to the **folder**, where you will be storing json files. For example, if you have a folder in the same head folder as project, use "./database" (you can use any name OS allows!)*<br /><br />

Done! Now you can use all functions of the database! But you also have to create a table. How to do this?<br />
### Create your first table!
There are many ways. The first one is very simple: do it manually. You can just create a json file with any name in the folder you specified in the constructor.<br />
the second one is more complicated but allows to do way more things. You need to import the **TableCreator** class.
> **WARNING!** THIS CLASS IS NOT STATED IN FULL DOCUMENTATION!
```js
import { TableCreator, LocalStorage } from 'moonlifedb';
const adapter = new LocalStorage({ path: './database' }); // this is an example!
const creator = new TableCreator(adapter);

creator.create("anyNameHere"); // Note #2, #3
```
***Note #2**: you can use any name **file system allows**. That means, for example, you can't use dots, start file names with numbers, etc.*<br />
***Note #3**: In current version it's **not supported**, but it also has second argument to create structure file for this table. It means you can strictly specify what types of values needed for this table.*<br /><br />

## How to work with Database?
The Database has some main methods to work with JSON files.<br />
For example we need to store some info about Bob in "accounts" table:
```json
{
    "Bob": {
        "age": 28,
        "loves": "coding"
    }
}
```
### Write
To write it, use `Database#create()` method:
```js
db.create('accounts', { 
    key: 'Bob', 
    value: { 
        "age": 28, 
        "loves": "coding" 
    }
});
```
### Read
To access it, use `Database#read()` method:
```js
const result = db.read('accounts', { key: 'Bob' });
// and it will return value we specified when created this line.
```
### Edit
If you want to edit some info about Bob, use `Database#edit()` method:
```js
db.edit('accounts', { key: 'Bob.loves', value: "music" }); // Note #4
```
***Note #4**: What you've seen is called **pointers**. If you want to know more about these, read the article **"What are pointers?"***<br /><br />

### Check
If you need to check if this key exists, use `Database#check()` method:
```js
db.check('accounts', { key: 'Bob' });
// Should return "true" (boolean) if this key actually exists.
// Returns "false" (boolean) if value of this key is undefined (does not exist in the database)
```

## How about asynchronous?
Yes, async functions are cool! You should definetly use them!<br />
`Database#create()` and `Database#edit()` are already async functions and they return a promise. That means if you do this:
```js
// this only works in async function's body
const result = await db.create('accounts', { key: 'Jack', value: { "age": 17, "loves": "animals" } })
// the "retult" variable will be the same, as value and you can work with it later.
```
With `Database#edit()` is a little different:
```js
const result = await db.edit('accounts', { key: 'Jack.age', value: 18 } })
// as you can see, we used pointers here.
// the "result" variable will not be the same as value. Instead, it returns whole value in database after it got edited. So it means it will be: { age: 18, loves: "animals" }
```

`Database#check()` is not async because it returns boolean. But we have a bit different method: `Database#checkres()`!<br />
It is asynchronous and it returns a promise. They also have the same signature and event recognizes both as "check"! If this key exists it returns it's value. If not it returns undefined:

```js
const result = await db.checkres('accounts', { key: 'Jack' });
// and it should return this: { age: 18, loves: "animals" }
```

## What are pointers?
Small but very important topic. What are pointers?<br />
They can specify what exactly you need to match. For example, if you have a big object in value, isn't painful to always edit whole object when you need to do a change in only 1 subkey?<br />
That's exactly what pointers fix! There are 2 types of them: dot `(.)` and tilde `(~)`.<br /><br />

### Dot pointer
**Dot** is allowed in any method (except `Database#create()`). It means precise path to this subkey. For example we have an object like this:
```json
"object": {
    "stats": {
        "hp": 10,
        "mana": 100
    },
    "heldItem": {
        "name": "Sword",
        "id": "1029812",
        "uidd": "6c813-141d4-63e5cb2-001",
        "abilities": {
            "first": {
                "mana": 20
            }
        }
    }
}
```
And for example we need to get uidd of held item. To do this we can just access it with:
```js
const result = db.read('items', { key: 'object' });
const uidd = result.heldItem.uidd
```
but it's too slow and tiring. Instead we can do:
```js
const result = db.read('items', { key: 'object.heldItem.uidd' });
```
It does absolutely the same, but way faster!<br />
What about other methods? Well, they work with the same principle. You can edit a single subkey, or you can check if subkey exists. Do what you want!<br /><br />

### Tilde pointer
**Tilde** is only allowed it Database#read() method and has 2 sides: `mainKey~subKey`. mainKey is the key, that you are trying to access, and subKey is a key of an object inside value of this mainKey. When doing a request with this pointer it returns an object with every occurence, that ends with subKey. For example, we have an object like this:
```json
"object": {
    "stats": {
        "hp": 10,
        "mana": 100
    },
    "heldItem": {
        "name": "Sword",
        "id": "1029812",
        "uidd": "6c813-141d4-63e5cb2-001",
        "abilities": {
            "first": {
                "mana": 20
            }
        }
    }
}
```
And if we do this request:
```js
const result = db.read('items', { key: 'object~mana' })
```
it returns an object like this:
```json
{
  "object.stats.mana": 100,
                ^^^^       
  "object.heldItem.abilities.first.mana": 20
                                   ^^^^ // Note #5
}
```
As you can see, every occurence ends with our subKey.<br />
***Note #5**: You **can't use comments** in JSON files! It only for **demonstration**!*<br /><br />

## Can I listen to these events?
### EventManager
Yes! Of course you can!<br />
You can use `EventManager` class to listen for access events.<br />
```js
const { EventManager } = require('moonlifedb');
const dbevents = new EventManager();

dbevents.on('access',
    async (event) => {
        console.log(event);
    }
)
```
### Event constructor
argument `event` returns `Event` class, which looks like this:
```ts
Event {
  method:    string, // Note #6
  type:     'get'|'put',
  body: {
    table:   string,
    key:     string,
    value:   any, // Note #7
    resolve: boolean,
    newline: boolean
  }:         object
}
```
***Note #6**: `Database#check()` and `Database#checkres()` have the same method name: **check**! The only difference is `Database#checkres() `has `Event.body.resolve` set to true!*<br /><br />
***Note #7**: `Event.body.value` is mostly used to return value of this key, but in some cases like `Database#check()` it returns **boolean** value because it method checks if value for this key exists and also because it's not async!*<br /><br />

# Documentation

> **WARNING!** If you can't find a class, that database has but not stated in documentation, it means it's still in development and not supported!

> **WARNING!** This documentation is still incomplete. Will be released fully in future updates!

## Database

Main database class to work with json files.

### Database Constructor

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| adapter | LocalStorage \| ExternalConnection | Adapter to search for the database folder. |
| settings | Object | Settings to control how database works. |

| PARAMETER 	| TYPE 	| DESCRIPTION 	|
|:---:	|:---:	|:---:	|
| alerts 	| boolean \| undefined 	| (optional) Should alerts be enabled? 	|
| ignoreDeprecations 	| boolean \| undefined 	| (optional) Should deprecation force alerts be ignorred? 	|
| useTabulation 	| JSONFormatter \| undefined 	| (optional) A constructor how database should be formatted (adds spacing for json objects) 	|
| type 	| ShardCollection \| 'SingleFile' \| undefined, 	| (optional, not supported) 	|

```ts
adapter: LocalStorage | ExternalConnection,
settings: {
    alerts: boolean | undefined,
    ignoreDeprecations: boolean | undefined
    overwrite: boolean | undefined,
    useTabulation: JSONFormatter | undefined
    type: ShardCollection | 'SingleFile' | undefined,
} | undefined
```

```ts
Database {
    adapter: LocalStorage | ExternalConnection;
    tablePath: string;
    ip: string | undefined;
    port: string | undefined;
    alerts: boolean;
    ignore: boolean;
    useTabulation: JSONFormatter | undefined;
    type: ShardCollection | 'SingleFile'
}
```

---

### Database#create()

Create a new line in database.

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| table | string | Table name: JSON file name |
| action | Object:<br>key: string<br>value: any<br>resolve?: boolean | key - identifier in table.<br>value - Value to be referred to this key.<br>(optional) resolve - resolve value of this object as promise. |

Returns `Promise<any|void>` and has `put` type.
```ts
table: string,
action: {
    key: string,
    value: any,
    resolve: boolean | undefined
}
```

---

### Database#edit()

Edit an existing line in database or create new one.

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| table | string | Table name: JSON file name |
| action | Object:<br>key: string<br>value: any<br>resolve?: boolean<br>newline?: boolean | key - identifier in table.<br>value - Value to be referred to this key.<br>(optional) resolve - resolve value of this object as promise.<br>(optional) newline - if this line does not exist, create it instead. |

Returns `Promise<any|void>` and has `put` type.
```ts
table: string,
action: {
    key: string,
    value: any,
    resolve: boolean | undefined
    newline: boolean | undefined
}
```

---

### Database#remove()

Remove a line in database.

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| table | string | Table name: JSON file name |
| action | Object:<br>key: string | key - identifier in table to delete |

Returns `Promise<void>` and has `put` type.
```ts
table: string,
action: {
    key: string
}
```

---

### Database#read()

Read and return a line from database.

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| table | string | Table name: JSON file name |
| action | Object:<br>key: string | key - identifier in table to search for |

Returns `any` and has `get` type.
```ts
table: string,
action: {
    key: string,
}
```

---

### Database#check()

Check if this line in database exists.

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| table | string | Table name: JSON file name |
| action | Object:<br>key: string | key - identifier in table to search for |

Returns `boolean` and has `get` type.
```ts
table: string,
action: {
    key: string,
}
```

---

### Database#checkres()

Check if this line in database exists.

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| table | string | Table name: JSON file name |
| action | Object:<br>key: string | key - identifier in table to search for |

> HAS THE SAME SIGNATURE "check" IN EVENT MANAGER!

Returns `Promise<any|undefined>` and has `get` type.
```ts
table: string,
action: {
    key: string,
}
```

---

## LocalStorage

Database adapter to search for folder on your local device.

### LocalStorage Constructor

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| options | Object:<br>path: string | A path to the database local folder. |

```ts
options: {
    path: string
}
```

```ts
LocalStorage {
    tablePath: string
}
```

---

## JSONFormatter

A formatter of JSON file: add tabulation.

### JSONFormatter Constructor

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| options | Object:<br>whitespace: number \| 'tab' \| '\t' \| undefined | A If `whitespace` undefined or 'tab' or '\t', it returns '\t'. If number, it returns that many spaces. |

```ts
options: {
    whitespace: number | 'tab' | '\t' | undefined,
} | undefined
```

```ts
JSONFormatter {
    whitespace: number | '\t'
}
```

---

## Event

Event constructor to contain information about single database access.

### Event Constructor

| PARAMETER | TYPE | DESCRIPTION |
|---|---|---|
| method | string | Method name. |
| type | string: 'get' \| 'put' | Type of database access. |
| body | object | Any object returned. |

```ts
Event {
    method: string,
    type: 'get'|'put',
    body: {
        table: string,
        key: string,
        value: any,
        resolve: boolean,
        newline: boolean
    }: object
}
```

---

## EventManager

Used to handle database access events and log them.

### EventManager Constructor

`EventManager` extends `EventEmitter`, no constructor needed.

---

### EventManager#on()

| PARAMETER | TYPE | DESCRIPTION |
|:---:|:---:|:---:|
| eventName | string \| symbol | EventName: moonlifedb uses "access" and "error" |
| listener | Event | function  |

```ts
table: string,
action: {
    key: string,
}
```

Example usage:
```ts
import { EventManager } from 'moonlifesdb'
const moonlifedb = new EventManager()

moonlifedb.on('access', 
    async (event: Event) => {
        console.log(event)
    }
)
```

---

## Snowflake

### Snowflake Constructor

| PARAMETER | TYPE | DESCRIPTION |
|---|---|---|
| settings | object | Read table below |

| PARAMETER | TYPE | DESCRIPTION |
|---|---|---|
| worker | number \| bigint | Zero-based worker ID in number or bigint. 0 by default and can't be negative. |
| epoch | number \| bigint | Epoch ofset in milliseconds where to start generating. |

```ts
Snowflake {
    worker: number | bigint;
    epoch: number | bigint;
    seq: number | bigint;
	lastTime: number | bigint;
}
```

---

### Snowflake#generate()

Generates unique SnowflakeID based on epoch, worker and sequence.

Returns `string`, no constructor required.

---

### Snowflake#generateRaw()

Generates unique SnowflakeID based on epoch, worker and sequence.
Also returns raw data: binary result, epoch (binary and decimal), worker (binary and decimal) and sequence (binary and decimal).

Returns `object`, no constructor required.
```ts
result: string,
raw: {
    result: string,
    epoch: number | bigint,
    epochBinary: string,
    worker: number | bigint,
    workerBinary: string,
    sequence: number | bigint,
    sequenceBinary: string
}
```

---

### Snowflake#decode()

Decodes snowflake and returns parts of it.

| PARAMETER | TYPE | DESCRIPTION |
|---|---|---|
| snowflake | string | SnowflakeID |

Returns `object`.
```ts
{
    epoch:    number | bigint,
    worker:   number | bigint, 
    sequence: number | bigint 
}
```

---

*Team Moonlife*