'use strict'

interface Event_Database {
    table: string,
    folder: string,
    query?: string | undefined,
    key?: string | null | undefined,
    value?: any | object | undefined,
    resolve?: boolean | undefined,
    newline?: boolean | undefined
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