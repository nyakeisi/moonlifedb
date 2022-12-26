'use strict'

import * as fs from 'fs';
import * as _ from 'lodash';
import { Memory } from './memory';
const lib = new Memory();

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

    public tablePath: string;
    protected alerts: boolean;
    protected overwrite: boolean;

    /**
     * The main class of an insta-write database app.
     * @example const database = new Database('dir', { alerts: true, overwrite: false });
     * @param {String} TablePath A path, that uses your database. (Supports multiple databases)
     * @param settings
     * @param alerts - Alert writes and removes to the console.
     * @param overwritre - global default parameter for overwriting.
     */
    constructor(
        TablePath: string, 
        settings?: {
            alerts: boolean | undefined,
            overwrite: boolean | undefined
        } | undefined
    ) {
        this.tablePath = TablePath;
        settings && settings.alerts
            ? this.alerts = settings.alerts
            : this.alerts = false
        settings && settings.overwrite
            ? this.overwrite = settings.overwrite
            : this.overwrite = false
        lib.checkDir(this.tablePath)
    }

    /**
     * Create a line in database. Allows to overwrite or make a copy. To edit, use Database#edit()
     * @example database.write('accounts', { key: 'keisi', value: { password: 'qwerty123' } })
     * @param {object} options
     * @param table define where to put data.
     * @param options.key unique key of a line in database.
     * @param options.value
     * @param options.overwrite (true by default) if false, adds a numeric index to key at the end to define copy.
     */
    public write (
        table: string,
        options: {
            key: string, 
            value: any, 
            overwrite?: boolean | undefined
        },
    ): void 
    {
        options.overwrite
         ? options.overwrite = options.overwrite
         : options.overwrite = false
        let data: any = fs.readFileSync(
            this.tablePath + '/' + table + '.json',
            'utf8'
        )
        data              = JSON.parse(data);
        data[options.key] = options.value
        fs.writeFileSync(
            this.tablePath + '/' + table + '.json',
            JSON.stringify(data)
        )
        return;
    }

    /**
     * Read and return a line from the database.
     * @example database.read('accounts', { key: 'User'})
     * @param {object} options
     * @param table define where to put data.
     * @param options.key unique key of a line in database
     * there are also pointers to get specific subkey.
     * "." to specify strictly how deep it is:
     * @example database.read('accounts', { key: 'User..id'} 
     * @example { User: { info: { data: { id: '123' } } } } returns { id: '123' }, that is pointer of 2
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
        },
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
            } else if (this.alerts == true) console.log("Returned 0: couldn't find anuthing with such key.")
        } else return data[options.key];
    }

    /**
     * Edits a line in database. You can\'t create a new line using this method.
     * @example database.edit('accounts', { key: 'keisi', value: { password: 'qwerty123' } })
     * @param {object} options
     * @param table define where to put data.
     * @param options.key unique key of a line in database. If you want to edit a subkey of it, use pointers instead.
     * @param options.value
     * @example database.edit('accounts', { key: 'keisi.data.personal.password', value: 'qwerty123' })
     * Warning: you cant use ".." or "~" pointers. This requires a strict path to the subkey. Use full path separated by dots: "keisi.data.personal.password"
     */
    public edit (
        table: string,
        options: {
            key: string, 
            value: any
        },
    ): void
    {
        var data: any = fs.readFileSync(
            this.tablePath + '/' + table + '.json',
            'utf8'
        )
        data = JSON.parse(data);
        if ((options.key).includes('~')) {
            const pointerError = "You can't use this pointer here. \nTry using full path: item.item2.lastItem etc.";
            throw new Error(pointerError);
        }
        if ((options.key).includes('.')) {
            let result = deepFind(data, options.key)
            if (result != undefined) {
                _.set(data, options.key, options.value);
                fs.writeFileSync(this.tablePath+'/'+table+'.json', JSON.stringify(data, null, 2));
            } else if (this.alerts == true) console.log("Returned 0: couldn't find anuthing with such key.")
        }
    }
}
