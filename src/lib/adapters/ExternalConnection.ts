'use strict'

export class ExternalConnection {

    public tablePath: string;
    public ip: string;
    public port: string;

    /**
     * NOT SUPPORTED YET
     * 
     * ExternalConnection adapter for the database app
     * @param options
     * @param path a path to the folder, where to store data
     * @param ip
     * @param port
     */

    constructor(
        options: {
            path: string,
            ip: string,
            port: number | string
        }
    ) {
        this.tablePath = options.path;
        this.ip = options.ip;
        this.port = String(options.port);
    }
}

// lissa squeens