'use strict'

import { Memory } from '../memory';
const lib = new Memory();

export class ShardCollection {

    public name: string;
    public indexing: boolean;
    public shardCount: 'auto' | number

    /**
     * NOT SUPPORTED YET
     * 
     * ShardCollection to create multiple tables connected in one.
     * @param options
     * @param name 
     * @param indexing used to create truth table, where for every shard is stated a key. Remember that key is still unique.
     * @param shardCount means how many shards you want to have. Recomended to use "auto" parameter
     */
    constructor(
        options: {
            name: string,
            indexing?: boolean | undefined,
            shardCount: 'auto' | number
        }
    ) {
        this.name = options.name
        options.indexing
         ? this.indexing = options.indexing
         : this.indexing = false
        this.shardCount = options.shardCount;
        
    }
}

// lissa squeens