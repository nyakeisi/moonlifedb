'use strict'

import { Memory } from '../memory';
const lib = new Memory();

export class ExternalConnection {

    public tablePath: string;
    public localip: string;
    public port: string;

    /**
     * ExternalConnection adapter for the database app
     * @param options
     * @param path a path to the folder, where to store data
     * @param ip
     * @param port
     * 
     * WARNING: CURRENTLY NOT SUPPORTED
     */

    constructor(
        options: {
            path: string,
            ip: string,
            port: number | string
        }
    ) {
        this.tablePath = options.path;
        this.localip = options.ip;
        this.port = String(options.port);
    }
}

// lissa squeens