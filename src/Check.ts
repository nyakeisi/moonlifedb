'use strict'
import * as fs from 'fs';

export class Check {
    public checkFile(tablePath: string, tableName: string) {
        if (
            !fs.existsSync(
                tablePath + '/' + tableName + '.json'
            )
        ) {
            const TableError = 'CHECK: TableError: Unable to find table .\\' + tablePath + '\\' + tableName + '.json'
            throw new Error(TableError)
        }
    }

    public checkDir(tablePath: string) {
        if (
            !fs.existsSync(
                tablePath
            )
        ) {
            const DirError = 'CHECK: DirError: Unable to find directory ' + tablePath
            throw new Error(DirError)
        }
    }

    public checkExternal(adapter: string) {
        if (
            !fs.existsSync(
                adapter
            )
        ) {
            const ExternalFileOrDirError = 'CHECK: ExternalFileOrDirError: Unable to find ' + adapter
            throw new Error(ExternalFileOrDirError)
        }
    }
}

// lissa squeens