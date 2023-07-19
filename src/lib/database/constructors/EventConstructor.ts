'use strict'

import { Memory } from '../CoreCheck';
const lib = new Memory();

export class Event {

    public method: string;
    public type: string;
    public body: object;

    constructor(
        method: string,
        type: string,
        body: object
    ) {
        this.method = method;
        this.type = type;
        this.body = body;
    }
}

// lissa squeens