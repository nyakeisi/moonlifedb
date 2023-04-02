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

export class SimpleDatabase {

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

    /**
     * Create a line in database. Allows to overwrite or make a copy. To edit, use Database#edit()
     * @example database.write('accounts', { key: 'keisi', value: { password: 'qwerty123' } })
     * 
     * @param {object} options
     * @param table define where to work with data.
     * @param options.key unique key of a line in database.
     * @param options.value
     * @param options.overwrite (true by default) if false, adds a numeric index to key at the end to define copy.
     */
    public async write (
        table: string,
        action: {
            key: string,
            value: any,
            overwrite?: boolean | undefined
        }
    ): Promise<any>;
    
    public async write (
        table: string,
        ...actions: [
            {
                key: string,
                value: any,
                overwrite?: boolean | undefined
            }[]
        ]
    ):  Promise<any[]>

    public async write (
        tableParameter: string,
        actionOrActions: any
    ):  Promise<any[]|any>
    {
        return new Promise(
            (resolve, reject) => {
                if (actionOrActions && actionOrActions instanceof Object && Array.isArray(actionOrActions)) {
                    // overload multiple
                    actionOrActions.forEach(
                        (action: any) => {
                            var overwrite: boolean;
                            action.overwrite != undefined
                                ? overwrite = action.overwrite
                                : overwrite = true
                            let data: any = fs.readFileSync(
                                this.tablePath + '/' + tableParameter + '.json',
                                'utf8'
                            )
                            data = JSON.parse(data);
                            if (data[action.key] != undefined && overwrite == false) return;
                            else {
                                data[action.key] = action.value
                                if (this.useTabulation != undefined) {
                                    fs.writeFileSync(
                                        this.tablePath + '/' + tableParameter + '.json',
                                        JSON.stringify(data, null, this.useTabulation.whitespace)
                                    )
                                } else {
                                    fs.writeFileSync(
                                        this.tablePath + '/' + tableParameter + '.json',
                                        JSON.stringify(data)
                                    )
                                }
                                resolve(action.value)
                            }
                        }
                    )
                } 
                else {
                    // overload single
                    var overwrite: boolean;
                    actionOrActions.overwrite != undefined
                        ? overwrite = actionOrActions.overwrite
                        : overwrite = true
                    let data: any = fs.readFileSync(
                        this.tablePath + '/' + tableParameter + '.json',
                        'utf8'
                    )
                    data = JSON.parse(data);
                    if (data[actionOrActions.key] != undefined && overwrite == false) return;
                    else {
                        data[actionOrActions.key] = actionOrActions.value
                        if (this.useTabulation != undefined) {
                            fs.writeFileSync(
                                this.tablePath + '/' + tableParameter + '.json',
                                JSON.stringify(data, null, this.useTabulation.whitespace)
                            )
                        } else {
                            fs.writeFileSync(
                                this.tablePath + '/' + tableParameter + '.json',
                                JSON.stringify(data)
                            )
                        }
                        resolve(actionOrActions.value)
                    }
                }
            }
        )
    }

    /**
     * Read and return a line from the database.
     * @example database.read('accounts', { key: 'User'})
     * @param {object} options
     * @param table define where to work with data.
     * @param options.key unique key of a line in database
     * there are also pointers to get specific subkey.
     * 
     * "." to specify strictly how deep it is:
     * @example database.read('accounts', { key: 'User..id'} 
     * @example { User: { info: { data: { id: '123' } } } } returns { id: '123' }, that is pointer of 2
     * 
     * and "~" to just find it:
     * @example database.read('accounts', { key: 'User~data'} 
     * @example { User: { info: { data: { id: '123' } } } } returns { id: '123' }.
     * Warning: using pointers may result to return an object because of duplicates.
     * If returns object, key means a complete path to that value.
     */
    
    public read (
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
                const syntaxError = 'key with pointer must have 2 or more sides. ' + (options.key).includes('~') ? '"~" means to find it. Returns an object' : 'Amount of dots mean how deep is it.';
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

    /**
     * Edits a line in database. You can\'t create a new line using this method.
     * @example database.edit('accounts', { key: 'keisi', value: { password: 'qwerty123' } })
     * 
     * @param {object} options
     * @param table define where to work with data.
     * @param options.key unique key of a line in database. If you want to edit a subkey of it, use pointers instead.
     * @param options.value
     * @param options.newline if you want to add a new line instead of editting existing one. Works with pointers.
     * @example database.edit('accounts', { key: 'keisi.data.personal.password', value: 'qwerty123' })
     * Warning: you can't use ".." or "~" pointers. This requires a strict path to the subkey. Use full path separated by dots: "keisi.data.personal.password"
     */
    public async edit (
        table: string,
        action: {
            key: string,
            value: any,
            newline?: boolean | undefined
        }
    ): Promise<any>;
    
    public async edit (
        table: string,
        ...actions: [
            {
                key: string,
                value: any,
                newline?: boolean | undefined
            }[]
        ]
    ): Promise<any[]>

    public async edit (
        tableParameter: string,
        actionOrActions: any
    ): Promise<any|any[]>
    {
        return new Promise(
            (resolve, reject) => {
                if (actionOrActions && actionOrActions instanceof Object && Array.isArray(actionOrActions)) {
                    actionOrActions.forEach(
                        (action: any) => {
                            var data: any = fs.readFileSync(
                                this.tablePath + '/' + tableParameter + '.json',
                                'utf8'
                            )
                            data = JSON.parse(data);
                            if ((action.key).includes('~')) return reject("You can't use this pointer here. \nTry using full path: item.item2.lastItem etc.")
                            if ((action.key).includes('.')) {
                                if (action.newline && action.newline == true) {
                                    _.set(data, action.key, action.value);
                                    if (this.useTabulation != undefined) {
                                        fs.writeFileSync(
                                            this.tablePath + '/' + tableParameter + '.json',
                                            JSON.stringify(data, null, this.useTabulation.whitespace)
                                        )
                                        resolve(this.read(tableParameter, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                                    } else {
                                        fs.writeFileSync(
                                            this.tablePath + '/' + tableParameter + '.json',
                                            JSON.stringify(data)
                                        )
                                        resolve(this.read(tableParameter, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                                    }
                                } else {
                                    let result = deepFind(data, action.key)
                                    if (result != undefined) {
                                        _.set(data, action.key, action.value);
                                        if (this.useTabulation != undefined) {
                                            fs.writeFileSync(
                                                this.tablePath + '/' + tableParameter + '.json',
                                                JSON.stringify(data, null, this.useTabulation.whitespace)
                                            )
                                            resolve(this.read(tableParameter, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                                        } else {
                                            fs.writeFileSync(
                                                this.tablePath + '/' + tableParameter + '.json',
                                                JSON.stringify(data)
                                            )
                                            resolve(this.read(tableParameter, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                                        }
                                    } else if (this.alerts == true) return console.log("Couldn't find anything with such key.")
                                }
                            } else {
                                data[action.key] = action.value;
                                if (this.useTabulation != undefined) {
                                    fs.writeFileSync(
                                        this.tablePath + '/' + tableParameter + '.json',
                                        JSON.stringify(data, null, this.useTabulation.whitespace)
                                    )
                                    resolve(this.read(tableParameter, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                                } else {
                                    fs.writeFileSync(
                                        this.tablePath + '/' + tableParameter + '.json',
                                        JSON.stringify(data)
                                    )
                                    resolve(this.read(tableParameter, { key: (action.key).length > 1 ? action.key.split('.')[0] : action.key }))
                                }
                            }
                        }
                    )
                } else {
                    var data: any = fs.readFileSync(
                        this.tablePath + '/' + tableParameter + '.json',
                        'utf8'
                    )
                    data = JSON.parse(data);
                    if ((actionOrActions.key).includes('~')) return reject("You can't use this pointer here. \nTry using full path: item.item2.lastItem etc.")
                    if ((actionOrActions.key).includes('.')) {
                        if (actionOrActions.newline && actionOrActions.newline == true) {
                            _.set(data, actionOrActions.key, actionOrActions.value);
                            if (this.useTabulation != undefined) {
                                fs.writeFileSync(
                                    this.tablePath + '/' + tableParameter + '.json',
                                    JSON.stringify(data, null, this.useTabulation.whitespace)
                                )
                                resolve(this.read(tableParameter, { key: (actionOrActions.key).length > 1 ? actionOrActions.key.split('.')[0] : actionOrActions.key }))
                            } else {
                                fs.writeFileSync(
                                    this.tablePath + '/' + tableParameter + '.json',
                                    JSON.stringify(data)
                                )
                                resolve(this.read(tableParameter, { key: (actionOrActions.key).length > 1 ? actionOrActions.key.split('.')[0] : actionOrActions.key }))
                            }
                        } else {
                            let result = deepFind(data, actionOrActions.key)
                            if (result != undefined) {
                                _.set(data, actionOrActions.key, actionOrActions.value);
                                if (this.useTabulation != undefined) {
                                    fs.writeFileSync(
                                        this.tablePath + '/' + tableParameter + '.json',
                                        JSON.stringify(data, null, this.useTabulation.whitespace)
                                    )
                                    resolve(this.read(tableParameter, { key: (actionOrActions.key).length > 1 ? actionOrActions.key.split('.')[0] : actionOrActions.key }))
                                } else {
                                    fs.writeFileSync(
                                        this.tablePath + '/' + tableParameter + '.json',
                                        JSON.stringify(data)
                                    )
                                    resolve(this.read(tableParameter, { key: (actionOrActions.key).length > 1 ? actionOrActions.key.split('.')[0] : actionOrActions.key }))
                                }
                            } else if (this.alerts == true) return console.log("Couldn't find anything with such key.")
                        }
                    } else {
                        data[actionOrActions.key] = actionOrActions.value;
                        if (this.useTabulation != undefined) {
                            fs.writeFileSync(
                                this.tablePath + '/' + tableParameter + '.json',
                                JSON.stringify(data, null, this.useTabulation.whitespace)
                            )
                            resolve(this.read(tableParameter, { key: (actionOrActions.key).length > 1 ? actionOrActions.key.split('.')[0] : actionOrActions.key }))
                        } else {
                            fs.writeFileSync(
                                this.tablePath + '/' + tableParameter + '.json',
                                JSON.stringify(data)
                            )
                            resolve(this.read(tableParameter, { key: (actionOrActions.key).length > 1 ? actionOrActions.key.split('.')[0] : actionOrActions.key }))
                        }
                    }
                }
            }
        )
    }

    /**
     * Removes a line in database. 
     * @example database.remove('accounts', { key: 'keisi' })
     * 
     * @param {object} options
     * @param table define where to work with data.
     * @param options.key unique key of a line in database.
     * Warning: you can't use pointers.
     */
    public async remove (
        table: string,
        options: {
            key: string
        },
    ): Promise<void>
    {
        return new Promise(
            (resolve, reject) => {
                var data: any = fs.readFileSync(
                    this.tablePath + '/' + table + '.json',
                    'utf8'
                )
                data = JSON.parse(data);
                if (data[options.key] == undefined && this.alerts == true) return console.log("Couldn't find anything with such key.")
                else {
                    data[options.key] = undefined;
                    if (this.useTabulation != undefined) {
                        fs.writeFileSync(
                            this.tablePath + '/' + table + '.json',
                            JSON.stringify(data, null, this.useTabulation.whitespace)
                        )
                    } else {
                        fs.writeFileSync(
                            this.tablePath + '/' + table + '.json',
                            JSON.stringify(data)
                        )
                    }
                }
                resolve();
            }
        )
    }

    /**
     * Checks if key exists in database. 
     * @example database.check('accounts', { key: 'keisi' })
     * 
     * @param {object} options
     * @param table define where to work with data.
     * @param options.key unique key of a line in database.
     * Warning: you can't use pointers.
     */
    public check (
        table: string,
        options: {
            key: string,
        },
    ): boolean
    {
        if ((options.key).includes('~')) {
            const pointerError = "You can't use this pointer here. \nTry using full path: item.item2.lastItem etc.";
            throw new Error(pointerError);
        }

        var data: any = fs.readFileSync(
            this.tablePath + '/' + table + '.json',
            'utf8'
        )
        data = JSON.parse(data)
        if ((options.key).includes('.')) {
            var uniq = (options.key).split(/[.]/gi);
            var uniqq = [...uniq]
            uniqq.shift()
            if (uniq.includes('')) uniq.splice(uniq.indexOf(''), 1);
            if (uniq.length <= 1) {
                const syntaxError = 'key with pointer must have 2 or more sides. Amount of dots mean how deep is it.';
                throw new Error(syntaxError);
            }
            if (data[uniq[0]] != undefined) {
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
                    let exist = false;
                    let amount = ((options.key).split('')).filter((e: string) => e === '.').length;
                    filter.forEach(
                        (item: any) => {
                            if (item.split('.').length == amount) {
                                exist = true
                            }
                        } 
                    )
                    return exist as boolean;
                } else return false as boolean;
            } else return false as boolean;
        } else return (
            data[options.key] == undefined
                ? false
                : true
        ) as boolean;
    }
}

// lissa squeens