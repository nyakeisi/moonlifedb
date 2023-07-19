'use strict'

import * as fs from 'fs';
import { Memory } from './CoreCheck';
import { LocalStorage } from './adapters/LocalStorage';
import { ExternalConnection } from './adapters/ExternalConnection';
const lib = new Memory();

interface TableParameters {
    [index: string]: ( 'auto-increment' | 'empty' | 'boolean' | 'string' | 'number' | 'decimal' | 'decimal' | 'hex' | 'binary' | 'octal' | 'bigint' | 'unknown' | 'object' | 'array' | 'infinity' | 'any'  )[]
}

export class BackupManager {

    public adapter: LocalStorage | ExternalConnection
    public backupAdapter: LocalStorage;

    public tablePath: string;
    public backupPath: string;

    /**
     * NOT SUPPORTED YET
     * 
     * The class to work with tables
     * @example const creator = new TableCreator(adapter);
     * @param adapter 
     */
    constructor(
        adapter: LocalStorage | ExternalConnection,
        backupAdapter: LocalStorage
    ) {
        this.adapter = adapter;
        this.backupAdapter = backupAdapter;
        this.tablePath = this.adapter.tablePath
        this.backupPath = this.backupAdapter.tablePath
        lib.checkDir(this.tablePath)
    }
}

// lissa squeens