'use strict'

import { Memory } from '../CoreCheck';
const lib = new Memory();

export class LocalStorage {

    public tablePath: string;

    /**
     * LocalStorage adapter for the database app
     * @param options
     * @param path a path to the folder, where to store data
     */
    constructor(
        options: {
            path: string
        }
    ) {
        this.tablePath = options.path;
    }
}

// lissa squeens