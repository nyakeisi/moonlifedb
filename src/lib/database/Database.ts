'use strict'

import * as fs from 'fs/promises';
import _ from 'lodash';
import { Check } from '../../Check';
import { LocalStorage, ExternalConnection } from '../../Adapters';
import { Formatter, DatabaseEvent, Logger } from '../../Constructors';
import { EventEmitter } from "node:events";
import { DeepKeyFinder } from './DeepKeyFinder'

const lib = new Check();
const dkf = new DeepKeyFinder()

export class Database extends EventEmitter {

    public adapter: LocalStorage | ExternalConnection;

    public tablePath: string;

    protected alerts: boolean;
    protected ignore: boolean;
    protected useTabulation: Formatter | undefined;

    /**
     * The main class of the database app.
     * @example const database = new Database(adapter, { alerts: true, useTabulation: tabulationResolvable });
     */
    constructor(
        adapter: LocalStorage | ExternalConnection,
        settings?: {
            alerts?: boolean | undefined,
            ignoreDeprecations?: boolean | undefined,
            useTabulation?: Formatter | undefined,
        } | undefined
    ) {
        super()
        this.adapter = adapter;
        this.tablePath = this.adapter.tablePath;

        settings && settings.alerts
            ? this.alerts = settings.alerts
            : this.alerts = false
        settings && settings.useTabulation
            ? this.useTabulation = settings.useTabulation
            : this.useTabulation = undefined
        settings && settings.ignoreDeprecations
            ? this.ignore = settings.ignoreDeprecations
            : this.ignore = false
        lib.checkDir(this.tablePath)
    }

    // MAIN METHODS
    
    private async get (
        table: string,
        options: {
            key: string
        }
    ): Promise<any|object>
    {
        return new Promise(
            async (resolve, reject) => {
                var data: any = await fs.readFile(
                    this.tablePath + '/' + table + '.json',
                    { encoding: 'utf8', flag: 'r' },
                )
                data = JSON.parse(data);
                if ((options.key).includes('.') || (options.key).includes('~')) {
                    var uniq = (options.key).split((options.key).includes('~') ? '~' : /[.]/gi);
                    var uniqq = [...uniq]
                    uniqq.shift()
                    if (uniq.includes('')) uniq.splice(uniq.indexOf(''), 1);
                    if (uniq.length < 1) {
                        const SyntaxError = "DATABASE: SyntaxError: Pointer must be Tilde or Dotted type.";
                        throw new Error(SyntaxError);
                    }
                    var deepkeys = dkf.getDeepKeys(data[uniq[0]]);
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
                                    result[item] = dkf.deepFind(data[uniq[0]], item)
                                } 
                            )
                            resolve(Object.keys(result).length == 1 ? result[Object.keys(result)[0]] : result as object|any);
                        } else {
                            var result: object = {};
                            var amount = ((options.key).split('')).filter((e: string) => e === '.').length;
                            filter.forEach(
                                (item: any) => {
                                    if (item.split('.').length == amount) {
                                        result[item] = dkf.deepFind(data[uniq[0]], item)
                                    }
                                } 
                            )
                            resolve(Object.keys(result).length == 1 ? result[Object.keys(result)[0]] : result as object|any);
                        }
                    } else if (this.alerts == true) return console.log("Couldn't find anything with such key.")
                } else resolve(data[options.key]);
            }
        )
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
            async (resolve, reject) => {
                if ((action.key).includes('~')) {
                    const SyntaxError = "DATABASE: SyntaxError: Tilde typed pointer is not supported in put request.";
                    throw new Error(SyntaxError);
                }
                var data: any = await fs.readFile(
                    this.tablePath + '/' + table + '.json',
                    { encoding: 'utf8', flag: 'r' },
                )
                data = JSON.parse(data);
                if ((action.key).includes('.')) {
                    if (action.newline && action.newline == true) {
                        _.set(data, action.key, action.value);
                        if (this.useTabulation != undefined) {
                            await fs.writeFile(
                                this.tablePath + '/' + table + '.json',
                                JSON.stringify(data, null, this.useTabulation.whitespace)
                            )
                            resolve(await this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                        } else {
                            await fs.writeFile(
                                this.tablePath + '/' + table + '.json',
                                JSON.stringify(data)
                            )
                            resolve(await this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                        }
                    } else {
                        let result = dkf.deepFind(data, action.key)
                        if (result != undefined) {
                            _.set(data, action.key, action.value);
                            if (this.useTabulation != undefined) {
                                await fs.writeFile(
                                    this.tablePath + '/' + table + '.json',
                                    JSON.stringify(data, null, this.useTabulation.whitespace)
                                )
                                resolve(await this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                            } else {
                                await fs.writeFile(
                                    this.tablePath + '/' + table + '.json',
                                    JSON.stringify(data)
                                )
                                resolve(await this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                            }
                        } else return;
                    }
                } else {
                    data[action.key] = action.value;
                    if (this.useTabulation != undefined) {
                        await fs.writeFile(
                            this.tablePath + '/' + table + '.json',
                            JSON.stringify(data, null, this.useTabulation.whitespace)
                        )
                        resolve(await this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                    } else {
                        await fs.writeFile(
                            this.tablePath + '/' + table + '.json',
                            JSON.stringify(data)
                        )
                        resolve(await this.get(table, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
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
     * To resolve value use "resolve: true" with await construction.
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
            const PointerError = "DATABASE: PointerError: Database#create() does not support pointers.";
            throw new Error(PointerError);
        }
        return new Promise(
            async (resolve, reject) => {
                await this.put(table, {key: action.key, value: action.value, newline: true});
                this.emit(
                    "access",
                    new DatabaseEvent(
                        'create', 
                        'put', 
                        {
                            table: table,
                            folder: this.adapter.tablePath,
                            key: action.key,
                            value: action.value,
                            resolve: action.resolve ? action.resolve : false,
                            newline: true
                        }
                    )
                )
                if (action.resolve == true) resolve(await this.get(table, {key: action.key}));
                else resolve(undefined)
            }
        )
    }

    // EDIT

     /**
     * Edits a line in database.
     * @note It's async, so it returns a promise.
     * To resolve value use "resolve: true" with await construction.
     * @warning "~" pointer is not allowed here.
     * @example const result = await Database.edit('table', { resolve: true, key: "example", value: "exampleValue" })
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
            const PointerError = "DATABASE: PointerError: Database#create() does not support Tilde typed pointer.";
            throw new Error(PointerError);
        }
        return new Promise(
            async (resolve, reject) => {
                if (!action.key.includes('.') && action.value == undefined) this.put(table, {key: action.key, value: action.value, newline: action.resolve ? action.resolve : false })
                // we are not expecting any response, so we just pass it
                else await this.put(table, {key: action.key, value: action.value, newline: action.resolve ? action.resolve : false });
                this.emit(
                    "access",
                    new DatabaseEvent(
                        'edit', 
                        'put', 
                        {
                            table: table,
                            folder: this.adapter.tablePath,
                            key: action.key,
                            value: action.value,
                            resolve: action.resolve ? action.resolve : false,
                            newline: action.newline ? action.newline : false
                        }
                    )
                )
                if (action.resolve == true) {
                    if (!action.key.includes('.') && action.value == undefined) resolve(this.get(table, {key: (action.key).split('.')[0]}));
                    else resolve(await this.get(table, {key: (action.key).split('.')[0]}));
                } else resolve(undefined)
            }
        )
    }

    // REMOVE

    /**
     * Removes a line in database or subkey.
     * @note It's async, so it returns a promise.
     * @warning "~" pointer is not allowed here.
     * @example const result = Database.remove('table', { key: "example" })
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
            const PointerError = "DATABASE: PointerError: Database#create() does not support Tilde typed pointer.";
            throw new Error(PointerError);
        }
        return new Promise(
            async (resolve, reject) => {
                this.put(table, {key: action.key, value: undefined});
                // we are not expecting any response, so we just pass it
                this.emit(
                    "access",
                    new DatabaseEvent(
                        'remove', 
                        'put', 
                        {
                            table: table,
                            folder: this.adapter.tablePath,
                            key: action.key,
                            value: undefined,
                            resolve: false,
                            newline: true
                        }
                    )
                )
                resolve()
            }
        )
    }

    // READ

    /**
     * Returns a value of this key.
     * @warning Any pointer is allowed.
     * @example const result = await Database.read('table', { key: "example" })
     * @note And it should return value of this key. Otherwise it returns undefined.
     * @returns {any|object|undefined}
     */

    public async read (
        table: string,
        action: {
            key: string,
        }
    ): Promise<any|object|undefined>
    {
        return new Promise(
            async (resolve, reject) => {
                lib.checkFile(this.tablePath, table)
                let _r = await this.get(table, {key: action.key});
                this.emit(
                    "access",
                    new DatabaseEvent(
                        'read', 
                        'get', 
                        {
                            table: table,
                            folder: this.adapter.tablePath,
                            key: action.key,
                            value: _r,
                            resolve: true,
                            newline: false
                        }
                    )
                )
                resolve(_r)
            }
        )
    }

    // KEYS

    /**
     * Returns array of all keys in this table.
     * @example const result = await Database.keys('table')
     * @returns {string[]}
     */

    public keys (
        table: string,
    ): Promise<string[]>
    {
        return new Promise(
            async (resolve, reject) => {
                lib.checkFile(this.tablePath, table)
                let data: any = await fs.readFile(
                    this.tablePath + '/' + table + '.json',
                    { encoding: 'utf8', flag: 'r' },
                )
                data = Object.keys(JSON.parse(data));
                this.emit(
                    "access",
                    new DatabaseEvent(
                        'keys', 
                        'get', 
                        {
                            table: table,
                            folder: this.adapter.tablePath,
                            key: null,
                            value: data,
                            resolve: false,
                            newline: false
                        }
                    )
                )
                resolve(data)
            }
        )
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

    public async check (
        table: string,
        action: {
            key: string,
        }
    ): Promise<boolean>
    {
        return new Promise(
            async (resolve, reject) => {
                lib.checkFile(this.tablePath, table)
                if ((action.key).includes('~')) {
                    const PointerError = "DATABASE: PointerError: Database#create() does not support Tilde typed pointer.";
                    throw new Error(PointerError);
                }
                let _r = await this.get(table, {key: action.key});
                if (_r instanceof Object) { 
                    this.emit(
                        "access",
                        new DatabaseEvent(
                            'check', 
                            'get', 
                            {
                                table: table,
                                folder: this.adapter.tablePath,
                                key: action.key,
                                value: (Object.keys(_r).length > 0 ? true : false),
                                resolve: false,
                                newline: false
                            }
                        )
                    )
                   resolve(Object.keys(_r).length > 0 ? true : false) 
                }
                else { 
                    this.emit(
                        "access",
                        new DatabaseEvent(
                            'check', 
                            'get', 
                            {
                                table: table,
                                folder: this.adapter.tablePath,
                                key: action.key,
                                value: (_r !== undefined ? true : false),
                                resolve: false,
                                newline: false
                            }
                        )
                    )
                    resolve(_r !== undefined ? true : false) 
                }
            }
        )
    }

    /**
     * Checks if this key exists in this table, but instead of boolean resolves value of this key.
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
            const PointerError = "DATABASE: PointerError: Database#create() does not support Tilde typed pointer.";
            throw new Error(PointerError);
        }
        return new Promise(
            async (resolve, reject) => {
                let _r = this.get(table, {key: action.key});
                if (_r instanceof Object) { 
                    this.emit(
                        "access",
                        new DatabaseEvent(
                            'check', 
                            'get', 
                            {
                                table: table,
                                folder: this.adapter.tablePath,
                                key: action.key,
                                value: (Object.keys(_r).length > 0 ? true : false),
                                resolve: true,
                                newline: false
                            }
                        )
                    )
                    resolve(Object.keys(_r).length > 0 ? _r : undefined) 
                }
                else { 
                    this.emit(
                        "access",
                        new DatabaseEvent(
                            'check', 
                            'get', 
                            {
                                table: table,
                                folder: this.adapter.tablePath,
                                key: action.key,
                                value: (_r !== undefined ? true : false),
                                resolve: true,
                                newline: false
                            }
                        )
                    )
                    resolve(_r !== undefined ? _r : undefined) 
                }
            }
        )
    }
}

// lissa squeens