'use strict'

interface Event_Database {
    table: string,
    folder: string,
    key: string | null,
    value: any,
    resolve: boolean,
    newline: boolean
}

export class DatabaseEvent {

    public method: string;
    public type: string;
    public body: Event_Database;

    constructor(
        method: string,
        type: string,
        body: Event_Database
    ) {
        this.method = method;
        this.type = type;
        this.body = body;
    }
}

// lissa squeens