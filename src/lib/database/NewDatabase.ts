'use strict'

import * as fs from 'fs/promises';
import { createReadStream, createWriteStream, readFileSync } from 'fs';
import _ from 'lodash';
import { Check } from '../../Check';
import { LocalStorage, ExternalConnection } from '../../Adapters';
import { DatabaseEvent, Logger } from '../../Constructors';
import { EventEmitter } from "node:events";
import { createInterface } from 'readline'

const lib = new Check();
type AllowedChunkSize = 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768 | 65536;
enum __AndOrOperator { AND = "&&", OR = "||" }
enum __Operator { GREATER = ">", LESS = "<", GREATEROREQUAL = ">=", LESSOREQUAL = "<=", EQUAL = "==", NOTEQUAL = "!=" }

export class NewDatabase extends EventEmitter {

    public adapter: LocalStorage | ExternalConnection;

    public tablePath: string;

    protected alerts: boolean;
    protected ignore: boolean;
    protected experimental: boolean;
    protected chunksize: AllowedChunkSize;

    /**
     * The main class of the database app.
     * @example const database = new NewDatabase(adapter, { alerts: true });
     * @version UNSTABLE! STILL HAS SOME MAJOR ISSUES!
     */
    constructor(
        adapter: LocalStorage | ExternalConnection,
        settings?: {
            alerts?: boolean | undefined,
            ignoreDeprecations?: boolean | undefined,
            ignoreExperimental?: boolean | undefined,
            chunkSize?: AllowedChunkSize | undefined
        } | undefined
    ) {
        super()
        this.adapter = adapter;
        this.tablePath = this.adapter.tablePath;

        settings && settings.alerts
            ? this.alerts = settings.alerts
            : this.alerts = false
        settings && settings.ignoreDeprecations
            ? this.ignore = settings.ignoreDeprecations
            : this.ignore = false
        settings && settings.ignoreExperimental
            ? this.experimental = settings.ignoreExperimental
            : this.experimental = false
        settings && settings.chunkSize
            ? this.chunksize = settings.chunkSize
            : this.chunksize = 1024
        lib.checkDir(this.tablePath)
    }

    private compare(
        el1: any,
        el2: any,
        operator: __Operator
    ): boolean 
    {
        switch (operator) {
            case __Operator.EQUAL: return el1 == el2
            case __Operator.NOTEQUAL: return el1 != el2
            case __Operator.GREATER: return el1 > el2
            case __Operator.GREATEROREQUAL: return el1 >= el2
            case __Operator.LESS: return el1 < el2
            case __Operator.LESSOREQUAL: return el1 <= el2
        }
    }

    private compareAndOr(
        el1: any,
        el2: any,
        operator: __AndOrOperator
    ): boolean 
    {
        switch (operator) {
            case __AndOrOperator.AND: return el1 && el2
            case __AndOrOperator.OR: return el1 || el2
        }
    }

    private finalize(
        _boolarray: boolean[],
        _operator: string[]
    ): boolean 
    {
        let __chain = _boolarray.reduce((carry: any[], current_value, index, original) => {carry.push(current_value);if((index+1) % 1 === 0 && _operator.length!=0) carry.push(_operator.shift());return carry;},[]);
        let _res: boolean = false;
        for (let i = 0; i < __chain.length; i++) if (typeof __chain[i] == 'string') _res = this.compareAndOr(__chain[i-1],__chain[i+1],__chain[i])
        return _res;
    }

    private async get (
        table: string,
        query: string,
        _chunksize: AllowedChunkSize,
        _limit: number
    ): Promise<any|object>
    {
        var __chunksize = _chunksize == undefined ? this.chunksize :_chunksize,
            __limit = _limit == undefined ? -1 : _limit;
        if (__limit < 1 && __limit != -1) throw new Error()
        return new Promise(async (resolve, reject) => {
            // prepare the request
            var __query = query.split(/(\s&&\s|\s\|\|\s)/g)
            var __bakedQuery: any[] = []
            __query?.forEach((__el: string) => {
                if (__el.replace(/\s/g,'') === __AndOrOperator.AND || __el.replace(/\s/g,'') === __AndOrOperator.OR) __bakedQuery.push(__el.replace(/\s/g,''))
                else __bakedQuery.push(__el.split(/\s/g))
            })
            // create stream and interface to use chunks of data
            const __fstr = createReadStream(this.tablePath + '/' + table + '.json');
            const __rl = createInterface({
                input: __fstr,
                crlfDelay: Infinity
            });
            let chunk = '';
            var result: Array<any> = [];
            // go through chunks
            for await (const line of __rl) {
                chunk += line;
                if (chunk.length >= __chunksize) {
                    if (result.length >= _limit) {
                        __fstr.close(); 
                        resolve(result);
                        break;
                    } 
                    for (const object of JSON.parse(chunk)) {
                        let __boolres: boolean[] = [],
                            __operres: string[] = [];
                        __bakedQuery.forEach((__eli: any, i: number) => {
                            if (Array.isArray(__eli)) {
                                var path: string[] = __bakedQuery[i][0].split('.');
                                var currentObject = object;
                                for (const property of path) {
                                    if (!currentObject.hasOwnProperty(property)) break;
                                    currentObject = currentObject[property];
                                }
                                __boolres.push(this.compare(currentObject, __bakedQuery[i][2], __bakedQuery[i][1]))
                            } else __operres.push(__eli)
                        })
                        if (__operres.length < 1) { if (__boolres[0] == true) result.push(object); }
                        else { if (this.finalize(__boolres, __operres) == true) result.push(object); }
                    }
                    chunk = '';
                }
            }
            // if chunk is incomplete
            if (chunk.length > 0) {
                if (result.length >= _limit) {
                    __fstr.close(); 
                    resolve(result);
                } 
                for (const object of JSON.parse(chunk)) {
                    let __boolres: boolean[] = [],
                        __operres: string[] = [];
                    __bakedQuery.forEach((__eli: any, i: number) => {
                        if (Array.isArray(__eli)) {
                            var path: string[] = __bakedQuery[i][0].split('.');
                            var currentObject = object;
                            for (const property of path) {
                                if (!currentObject.hasOwnProperty(property)) break;
                                currentObject = currentObject[property];
                            }
                            __boolres.push(this.compare(currentObject, __bakedQuery[i][2], __bakedQuery[i][1]))
                        } else __operres.push(__eli)
                    })
                    if (__operres.length < 1) { if (__boolres[0] == true) result.push(object); }
                    else { if (this.finalize(__boolres, __operres) == true) result.push(object); }
                }
            }
            // close the stream and resolve
            __fstr.close(); 
            resolve(result)
        })
    }

    // STILL IN DEVELOPMENT
    private async put (
        table: string,
        value: object
    ): Promise<any>
    {
        return new Promise(async (resolve, reject) => {
            const writer = createWriteStream(this.tablePath + '/' + table + '.json');
            const buffer = Buffer.alloc(0);
            buffer.write(JSON.stringify(value));
            writer.write(buffer);
            writer.end();
        })
    }

    public async create (
        table: string,
        value: object
    ): Promise<void> {
        lib.checkFile(this.tablePath, table)
        return new Promise(
            async (resolve, reject) => {
                await this.put(table, value);
                this.emit(
                    "access",
                    new DatabaseEvent(
                        'create', 
                        'put', 
                        {
                            table: table,
                            folder: this.adapter.tablePath,
                            value: value,
                            newline: true
                        }
                    )
                )
            }
        )
    }

    public async find (
        table: string,
        query: string
    ): Promise<any|object|undefined>
    {
        return new Promise(
            async (resolve, reject) => {
                lib.checkFile(this.tablePath, table)
                let _r = await this.get(table, query, 2048, -1);
                this.emit(
                    "access",
                    new DatabaseEvent(
                        'find', 
                        'get', 
                        {
                            table: table,
                            folder: this.adapter.tablePath,
                            query: query,
                            value: _r,
                            resolve: true,
                        }
                    )
                )
                resolve(_r)
            }
        )
    }
}

// lissa squeens