'use strict'

// this file is only for file checking during database initialization.

import * as fs from 'fs';

export class Memory {
    public checkFile(tablePath: string, tableName: string) {
        if (
            !fs.existsSync(
                tablePath + '/' + tableName + '.json'
            )
        ) {
            const fileError = '\u001b[1;31mUnable to find table .\\' + tableName + '.json' + '\u001b[0m'
            throw new Error(fileError)
        }
    }

    public checkDir(tablePath: string) {
        if (
            !fs.existsSync(
                tablePath
            )
        ) {
            const dirError = '\u001b[1;31mUnable to find dir \\' + tablePath + '\\' + '\u001b[0m'
            throw new Error(dirError)
        }
    }

    public checkAny(adapter: string) {
        if (
            !fs.existsSync(
                adapter
            )
        ) {
            const fileDirError = '\u001b[1;31mUnable to find ' + adapter + '\u001b[0m'
            throw new Error(fileDirError)
        }
    }
}