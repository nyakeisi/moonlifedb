'use strict'

import * as fs from 'fs';
import * as _ from 'lodash';
import { Memory } from './memory';
import { LocalStorage, ExternalConnection } from './adapter';
const lib = new Memory();
import { JSONFormatter, ShardCollection } from './constructor';

var getDeepKeys = (obj: object): any[] => {
    var keys: any[] = [];
    for(var key in obj) {
        keys.push(key);
        if(typeof obj[key] === "object") {
            var subkeys = getDeepKeys(obj[key]);
            keys = keys.concat(
                subkeys.map(
                    function(subkey) {
                        return key + "." + subkey;
                    }
                )
            );
        }
    }
    return keys;
}

function deepFind(obj: object, path: string): any {
    var paths = path.split('.'), 
        current = obj, 
        i;
    for (let i = 0; i < paths.length; i++) {
        if (current[paths[i]] == undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
}

export class Database {

    public adapter: LocalStorage | ExternalConnection;

    public tablePath: string;
    public ip: string | undefined;
    public port: string | undefined;

    protected alerts: boolean;
    protected overwrite: boolean;
    protected useTabulation: JSONFormatter | undefined;
    public type: ShardCollection | 'SingleFile'

    /**
     * The main class of an insta-write database app.
     * @example const database = new Database(adapter, { alerts: true, overwrite: false, useTabulation: tabulationResolvable });
     * 
     * @param adapter
     * @param settings
     * @param alerts - Alert writes and removes to the console.
     * @param overwrite - Global default parameter for overwriting.
     * @param useTabulation - Use tabulation when formatting json file 
     */
    constructor(
        adapter: LocalStorage | ExternalConnection,
        settings?: {
            alerts?: boolean | undefined,
            overwrite?: boolean | undefined,
            useTabulation?: JSONFormatter | undefined
            type?: ShardCollection | 'SingleFile' | undefined,
        } | undefined
    ) {
        this.adapter = adapter;

        switch (true) {
            case this.adapter instanceof ExternalConnection: {
                this.tablePath = this.adapter.tablePath;
                this.adapter instanceof ExternalConnection
                    ? this.ip = this.adapter.localip
                    : this.ip = undefined;
                this.adapter instanceof ExternalConnection
                    ? this.port = this.adapter.port
                    : this.port = undefined;
                break;
            }
            case this.adapter instanceof LocalStorage: {
                this.tablePath = this.adapter.tablePath;
                break;
            }
            default: {
                const adapterError = 'adapter must be instance of LocalStorage or ExternalConnection'
                throw new Error(adapterError)
            }
        }

        settings && settings.type
            ? this.type = settings.type
            : this.type = 'SingleFile'
        settings && settings.alerts
            ? this.alerts = settings.alerts
            : this.alerts = false
        settings && settings.overwrite
            ? this.overwrite = settings.overwrite
            : this.overwrite = false
        settings && settings.useTabulation
            ? this.useTabulation = settings.useTabulation
            : this.useTabulation = undefined
        lib.checkDir(this.tablePath)
    }

    // MAIN METHODS
    
    private get (
        table: string,
        options: {
            key: string
        }
    ): any | object
    {
        let data: any = fs.readFileSync(
            this.tablePath + '/' + table + '.json',
            'utf8'
        )
        data = JSON.parse(data);
        if ((options.key).includes('.') || (options.key).includes('~')) {
            var uniq = (options.key).split((options.key).includes('~') ? '~' : /[.]/gi);
            var uniqq = [...uniq]
            uniqq.shift()
            if (uniq.includes('')) uniq.splice(uniq.indexOf(''), 1);
            if (uniq.length < 1) {
                const syntaxError = 'key with pointer must have 2 or more sides. ' + (options.key).includes('~') ? '"~" - finds all occurences and returns an object.\nSyntax is "MainKey~YouSubKey"' : 'Amount of dots mean how deep it is: "MainKey.SubKey1.Subkey2" etc.';
                throw new Error(syntaxError);
            }
            var deepkeys = getDeepKeys(data[uniq[0]]);
            if (deepkeys != undefined) {
                var filter: any[] = [];
                if (uniq.length > 1) {
                    deepkeys.forEach(
                        (deepkey: string) => {
                            if (deepkey == uniqq.join('.')) filter.push(deepkey);
                        }
                    )
                } else {
                    deepkeys.forEach(
                        (deepkey: string) => {
                            if (deepkey.endsWith(uniq[uniq.length - 1])) filter.push(deepkey);
                        }
                    )
                }
                if ((options.key).includes('~')) {
                    var result: object = {};
                    filter.forEach(
                        (item: any) => {
                            result[item] = deepFind(data[uniq[0]], item)
                        } 
                    )
                    return Object.keys(result).length == 1 ? result[Object.keys(result)[0]] : result as object|any;
                } else {
                    var result: object = {};
                    var amount = ((options.key).split('')).filter((e: string) => e === '.').length;
                    filter.forEach(
                        (item: any) => {
                            if (item.split('.').length == amount) {
                                result[item] = deepFind(data[uniq[0]], item)
                            }
                        } 
                    )
                    return Object.keys(result).length == 1 ? result[Object.keys(result)[0]] : result as object|any;
                }
            } else if (this.alerts == true) return console.log("Couldn't find anything with such key.")
        } else return data[options.key];
    }

    private async put (
        table: string,
        action: {
            key: string,
            value: any,
            newline?: boolean | undefined
        }
    ): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                var data: any = fs.readFileSync(
                    this.tablePath + '/' + table + '.json',
                    'utf8'
                )

                data = JSON.parse(data);
                if ((action.key).includes('.')) {
                    if (action.newline && action.newline == true) {
                        _.set(data, action.key, action.value);
                        if (this.useTabulation != undefined) {
                            fs.writeFileSync(
                                this.tablePath + '/' + table + '.json',
                                JSON.stringify(data, null, this.useTabulation.whitespace)
                            )
                            resolve(this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                        } else {
                            fs.writeFileSync(
                                this.tablePath + '/' + table + '.json',
                                JSON.stringify(data)
                            )
                            resolve(this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                        }
                    } else {
                        let result = deepFind(data, action.key)
                        if (result != undefined) {
                            _.set(data, action.key, action.value);
                            if (this.useTabulation != undefined) {
                                fs.writeFileSync(
                                    this.tablePath + '/' + table + '.json',
                                    JSON.stringify(data, null, this.useTabulation.whitespace)
                                )
                                resolve(this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                            } else {
                                fs.writeFileSync(
                                    this.tablePath + '/' + table + '.json',
                                    JSON.stringify(data)
                                )
                                resolve(this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                            }
                        } else return;
                    }
                } else {
                    data[action.key] = action.value;
                    if (this.useTabulation != undefined) {
                        fs.writeFileSync(
                            this.tablePath + '/' + table + '.json',
                            JSON.stringify(data, null, this.useTabulation.whitespace)
                        )
                        resolve(this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                    } else {
                        fs.writeFileSync(
                            this.tablePath + '/' + table + '.json',
                            JSON.stringify(data)
                        )
                        resolve(this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                    }
                }
            }
        )
    }

    // PUBLIC METHODS

    // CREATE

    /**
     * Creates a new line in database.
     * @note It's async, so it returns a promise.
     * @warning Pointers are not allowed in this method.
     * @example const result = await Database.create('table', { key: "example", value: "exampleValue" })
     * @param action.resolve resolves value of this key after it's creation in database.
     * @returns {Promise<any|void>}
     * @async
     * @deprecated This method is marked as deprecated. Use create() instead.
     */

    public async write (
        table: string,
        action: {
            key: string,
            value: any,
            resolve?: boolean | undefined
        }
    ): Promise<any|void> {
        lib.checkFile(this.tablePath, table)
        if ((action.key).includes('~') || (action.key).includes('.')) {
            const pointerError = "Pointers are not allowed in this method.";
            throw new Error(pointerError);
        }
        return new Promise(
            async (resolve, reject) => {
                await this.put(table, {key: action.key, value: action.value, newline: true});
                if (action.resolve == true) resolve(this.get(table, {key: action.key}))
            }
        )
    }

    /**
     * Creates a new line in database.
     * @note It's async, so it returns a promise.
     * @warning Pointers are not allowed in this method.
     * @example const result = await Database.create('table', { key: "example", value: "exampleValue" })
     * @param action.resolve resolves value of this key after it's creation in database.
     * @returns {Promise<any|void>}
     * @async
     */

    public async create (
        table: string,
        action: {
            key: string,
            value: any,
            resolve?: boolean | undefined
        }
    ): Promise<any|void> {
        lib.checkFile(this.tablePath, table)
        if ((action.key).includes('~') || (action.key).includes('.')) {
            const pointerError = "Pointers are not allowed in this method.";
            throw new Error(pointerError);
        }
        return new Promise(
            async (resolve, reject) => {
                await this.put(table, {key: action.key, value: action.value, newline: true});
                if (action.resolve == true) resolve(this.get(table, {key: action.key}));
            }
        )
    }

    // EDIT

     /**
     * Edits a line in database.
     * @note It's async, so it returns a promise.
     * @warning "~" pointer is not allowed here.
     * @example const result = await Database.edit('table', { key: "example", value: "exampleValue" })
     * @param action.newline if true and if this key/subkey does not exist, it creates it instead.
     * @param action.resolve resolves value of this key after changes in database.
     * @returns {Promise<any|void>}
     * @async
     */

    public async edit (
        table: string,
        action: {
            key: string,
            value: any,
            newline?: boolean | undefined,
            resolve?: boolean | undefined
        }
    ): Promise<any|void> 
    {
        lib.checkFile(this.tablePath, table)
        if ((action.key).includes('~')) {
            const pointerError = "Pointer \"~\" is not allowed in this method.";
            throw new Error(pointerError);
        }
        return new Promise(
            async (resolve, reject) => {
                await this.put(table, {key: action.key, value: action.value, newline: action.newline });
                if (action.resolve == true) resolve(this.get(table, {key: (action.key).split('.')[0]}));
            }
        )
    }

    // REMOVE

    /**
     * Removes a line in database or subkey.
     * @note It's async, so it returns a promise.
     * @warning "~" pointer is not allowed here.
     * @example const result = await Database.remove('table', { key: "example" })
     * @note you can use it without await, because it's a void method.
     * @returns {Promise<void>}
     * @async
     */

    public async remove (
        table: string,
        action: {
            key: string,
        }
    ): Promise<void> {
        lib.checkFile(this.tablePath, table)
        if ((action.key).includes('~')) {
            const pointerError = "Pointer \"~\" is not allowed in this method.";
            throw new Error(pointerError);
        }
        return new Promise(
            async (resolve, reject) => {
                await this.put(table, {key: action.key, value: undefined});
            }
        )
    }

    // READ

    /**
     * Returns a value of this key.
     * @warning Any pointer is allowed.
     * @example const result = Database.read('table', { key: "example" })
     * @note And it should return value of this key. Otherwise it returns undefined.
     * @returns {any|object|undefined}
     */

    public read (
        table: string,
        action: {
            key: string,
        }
    ): any | object | undefined
    {
        lib.checkFile(this.tablePath, table)
        let _r = this.get(table, {key: action.key});
        return _r as any;
    }

    // CHECK

    /**
     * Checks if this key exists in this table.
     * @note Returns boolean value.
     * @warning "~" pointer is not allowed here. If using "." pointer it returns an object 
     * @example const result = Database.check('table', { key: "example" })
     * @note And it should return true, if exists. Otherwise it returns false.
     * @returns {Boolean}
     */

    public check (
        table: string,
        action: {
            key: string,
        }
    ): boolean
    {
        lib.checkFile(this.tablePath, table)
        if ((action.key).includes('~')) {
            const pointerError = "Pointer \"~\" is not allowed in this method.";
            throw new Error(pointerError);
        }
        let _r = this.get(table, {key: action.key});
        if (_r instanceof Object) { return (Object.keys(_r).length > 0 ? true : false) }
        else { return (_r !== undefined ? true : false) }
    }

    /**
     * Same as Database#check(), but resolvable.
     * @note It means that it returns a promise. If key is not undefined, it resolves it and can be accessed with await or .then() construction.
     * @warning "~" pointer is not allowed here. If using "." pointer it returns an object 
     * @example const result = await Database.checkres('table', { key: "example" })
     * @note And it should return value of this key, if exists. Otherwise it returns undefined.
     * @returns {Promise<any|undefined>}
     * @async
     */

    public async checkres (
        table: string,
        action: {
            key: string,
        }
    ): Promise<any|undefined>
    {
        lib.checkFile(this.tablePath, table)
        if ((action.key).includes('~')) {
            const pointerError = "Pointer \"~\" is not allowed in this method.";
            throw new Error(pointerError);
        }
        return new Promise(
            async (resolve, reject) => {
                let _r = this.get(table, {key: action.key});
                if (_r instanceof Object) { resolve(Object.keys(_r).length > 0 ? _r : undefined) }
                else { resolve(_r !== undefined ? _r : undefined) }
            }
        )
    }
}

// lissa squeens
