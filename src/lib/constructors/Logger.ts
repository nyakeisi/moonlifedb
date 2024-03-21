'use strict'

import * as fs from 'fs/promises';
import { Check } from '../../Check';
import { LocalStorage, ExternalConnection } from '../../Adapters';
import { ArrayDatabase } from '../database/ArrayDatabase';
import { DatabaseEvent } from './DatabaseEvent'

interface UserInput {
    content: string,
    type: "INFO" | "DEBUG" | "WARN" | "ERROR" | "FAIL"
}

export class Logger {
    public adapter: LocalStorage | ExternalConnection;
    public folderMode: boolean;
    private localFileName: string | undefined;

    /**
     * A class to work with logging file.
     * @param adapter a path to txt file, where to store logs
     * @param folderMode true - store files in folder, otherwise single file.
     */
    constructor(
        options: {
            adapter: LocalStorage | ExternalConnection,
            folderMode: boolean | undefined
        }
    ) {
        this.adapter = options.adapter;
        options.folderMode != undefined ? this.folderMode = options.folderMode : this.folderMode = false;
        if (!this.adapter.tablePath.endsWith('.log') && this.folderMode == false) {
            const PathError = "LOGGER: PathError: adapter's path must lead to .log file.";
            throw new Error(PathError);
        }
    }

    public write(
        obj: DatabaseEvent | UserInput,
        additional?: string | undefined
    ): void
    {
        if (this.folderMode == true && this.localFileName == undefined) {
            const SyntaxError = "LOGGER: SyntaxError: with folderMode set to 'true' you must use Logger.create() to create a file inside this folder.";
            throw new Error(SyntaxError);
        }
        fs.appendFile(this.folderMode == true ? this.adapter.tablePath+'/'+this.localFileName : this.adapter.tablePath, 
            obj instanceof DatabaseEvent 
                ? `${new Date().toLocaleString('en-US', {timeZone: 'UTC', 'hour12': false, day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', 'minute': '2-digit', second: '2-digit'}).replace(/,/g, '')} INFO ${obj.type.toUpperCase()} REQUEST: Database#${obj.method}() -> ${obj.body.folder}/${obj.body.table}.json${additional ? ` :: ${additional}` : ''}\n`
                : `${new Date().toLocaleString('en-US', {timeZone: 'UTC', 'hour12': false, day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', 'minute': '2-digit', second: '2-digit'}).replace(/,/g, '')} ${obj.type} ${obj.content}`
        )
    }

    public async create(
    ): Promise<string>
    {
        if (this.folderMode == false) {
            const SyntaxError = "LOGGER: SyntaxError: there is no need to use Logger.create() with single file mode.";
            throw new Error(SyntaxError);
        }
        return new Promise(
            async (resolve, reject) => {
                let _fname = `${new Date().toLocaleString('en-US', {timeZone: 'UTC', 'hour12': false, day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', 'minute': '2-digit', second: '2-digit'}).replace(/,/g, '').replace(/\//g, '-').replace(/\s/g, '_').replace(/:/g, '-')}`
                await fs.writeFile(this.adapter.tablePath+'\\'+_fname+'.log',
                    `${new Date().toLocaleString('en-US', {timeZone: 'UTC', 'hour12': false, day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', 'minute': '2-digit', second: '2-digit'}).replace(/,/g, '')} WARN Created a new .log file -> "${_fname}.log"\n`
                )
                this.localFileName = _fname+'.log'
                resolve(_fname+'.log')
            }
        )
    }
}

// lissa squeens