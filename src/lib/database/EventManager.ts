'use strict'
import * as fs from 'fs';
import { EventEmitter } from "node:events";
import { Event } from './constructors/EventConstructor';

export class EventManager extends EventEmitter {
    constructor() {
        super();
    }

    public success (
        event: Event
    ): void
    {
        this.emit(
            'access',
            event as Event
        );
    }

    public error (
        reason?: string | undefined
    ): void
    {
        this.emit(
            "error", 
            reason ? reason : "unknown error"
        );
    }
}

// lissa squeens