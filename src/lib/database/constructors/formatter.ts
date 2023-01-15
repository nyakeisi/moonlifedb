'use strict'

export class JSONFormatter {

    public whitespace: number | '\t';

    /**
     * JSONFormatter constructor
     * Use this as constructor for tabulation and lines.
     * @param options 
     * @param whitespace number, "tab" or "\t". Number means how much spaces to use after. "tab" is tabulation.
     */
    constructor(
        options?: {
            whitespace?: number | 'tab' | '\t' | undefined,
        } | undefined
    ) {
        if (options) {
            options.whitespace != undefined
                ? this.whitespace = options.whitespace == 'tab' ? '\t' : options.whitespace
                : this.whitespace = '\t'
        } else {
            this.whitespace = '\t'
        }
    }
}

// lissa squeens