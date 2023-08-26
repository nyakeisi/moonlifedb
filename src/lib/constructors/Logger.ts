'use strict'

import * as fs from 'fs/promises';
import { Check } from '../../Check';
import { LocalStorage, ExternalConnection } from '../../Adapters';
import { Database } from '../database/Database';
import { DatabaseEvent } from './DatabaseEvent'

export class Logger {
    public adapter: LocalStorage | ExternalConnection;

    /**
     * A class to work with logging file.
     * @param adapter a path to txt file, where to store logs
     */
    constructor(
        adapter: LocalStorage | ExternalConnection,
    ) {
        this.adapter = adapter;
        if (!this.adapter.tablePath.endsWith('.log')) {
            const PathError = "LOGGER: PathError: adapter's path must lead to .log, .txt or any other plain text file.";
            throw new Error(PathError);
        }
    }

    public write(
        obj: DatabaseEvent,
        additional?: string | undefined
    ): void
    {
        fs.appendFile(this.adapter.tablePath, 
            `${new Date().toLocaleString('en-US', {timeZone: 'UTC', 'hour12': false, day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', 'minute': '2-digit', second: '2-digit'}).replace(/,/g, '')} INFO ${obj.type.toUpperCase()} REQUEST: Database#${obj.method}() -> ${obj.body.folder}/${obj.body.table}.json${additional ? ` :: ${additional}` : ''}\n`
        )
    }
}

// lissa squeens