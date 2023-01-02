'use strict'

import { Memory } from '../memory';
const lib = new Memory();

export class ExternalConnection {

    public tablePath: string;
    public localip: string;
    public port: string;

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