'use strict'

import { Memory } from '../memory';
const lib = new Memory();

export class LocalStorage {

    public tablePath: string;

    constructor(
        options: {
            path: string
        }
    ) {
        this.tablePath = options.path;
    }
}
