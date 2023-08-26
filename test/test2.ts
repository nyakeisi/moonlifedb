import * as fs from 'fs'
import { Database, LocalStorage, Formatter, Logger, Snowflake, DatabaseEvent } from "../src/Index";

const db = new Database(
   new LocalStorage({ path: './database' }), 
   { useTabulation: new Formatter({ whitespace: 'tab' }) }
);

const lg = new Logger(new LocalStorage({ path:  './logger.log'}))
db.on('access', 
   async (event: DatabaseEvent) => {
      console.log(event)
      lg.write(event)
   }
)

async function main() {
   
}
main()

