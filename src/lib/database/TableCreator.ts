'use strict'

import * as fs from 'fs';
import { Memory } from './CoreCheck';
import { LocalStorage } from './adapters/LocalStorage';
import { ExternalConnection } from './adapters/ExternalConnection';
import { JSONFormatter } from './ConstructorExporter';
const lib = new Memory();

interface TableParameters {
    [index: string]: ('auto-increment' | 'snowflake' | 'empty' | 'boolean' | 'string' | 'number' | 'decimal' | 'decimal' | 'hex' | 'binary' | 'octal' | 'bigint' | 'unknown' | 'object' | 'array' | 'infinity' | 'any')
}

export class TableCreator {

    public adapter: LocalStorage | ExternalConnection
    public useTabulation: JSONFormatter | undefined;

    public tablePath: string;
    public ip: string | undefined;
    public port: string | undefined;

    /**
     * NOT SUPPORTED YET
     * 
     * The class to work with tables
     * @example const creator = new TableCreator(adapter);
     * @param adapter 
     */
    constructor(
        adapter: LocalStorage | ExternalConnection,
        options?: {
            useTabulation?: JSONFormatter | undefined
        }
    ) {
        this.adapter = adapter;
        this.tablePath = this.adapter.tablePath
        
        if (this.adapter instanceof ExternalConnection) {
            this.ip = this.adapter.localip
            this.port = this.adapter.port
        }

        options && options.useTabulation
            ? this.useTabulation = options.useTabulation
            : this.useTabulation = undefined

        lib.checkDir(this.tablePath)
    }

    /**
     * NOT SUPPORTED YET
     */
    public create (
        name: string,
        settings?: {
            strict: TableParameters,
        } | undefined,
    ): void 
    {
        lib.checkDir(this.tablePath);
        let result = {};
        if (fs.existsSync(this.tablePath + '/' + name + '.json')) console.log('Alert: already exists in the database: overwritten')
        fs.writeFileSync(this.tablePath + '/' + name + '.json', JSON.stringify(result));
        if (settings && settings.strict) fs.writeFileSync(this.tablePath + '/' + name + '-structure.json', JSON.stringify(settings.strict, null, this.useTabulation == undefined ? '\t' : this.useTabulation.whitespace));
    }
}

// lissa squeens