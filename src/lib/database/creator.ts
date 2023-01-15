'use strict'

import * as fs from 'fs';
import { Memory } from './memory';
import { LocalStorage } from './adapters/LocalStorage';
import { ExternalConnection } from './adapters/ExternalConnection';
const lib = new Memory();

interface TableParameters {
    [index: string]: ( 'auto-increment' | 'empty' | 'boolean' | 'string' | 'number' | 'decimal' | 'decimal' | 'hex' | 'binary' | 'octal' | 'bigint' | 'unknown' | 'object' | 'array' | 'infinity' | 'any'  )[]
}

export class TableCreator {

    public adapter: LocalStorage | ExternalConnection

    public tablePath: string;
    public ip: string | undefined;
    public port: string | undefined;

    /**
     * The class to work with tables
     * @example const creator = new TableCreator(adapter);
     * @param adapter 
     */
    constructor(
        adapter: LocalStorage | ExternalConnection,
    ) {
        this.adapter = adapter;
        this.tablePath = this.adapter.tablePath

        // for external connection
        if (this.adapter instanceof ExternalConnection) {
            this.ip = this.adapter.localip
            this.port = this.adapter.port
        }

        lib.checkDir(this.tablePath)
    }

    /**
     * 
     * @example 
     */
    public create (
        name: string,
        strict?: {
            data: TableParameters,
        } | undefined,
    ): void 
    {
        if (strict) console.log(strict.data)
    }
}

// lissa squeens