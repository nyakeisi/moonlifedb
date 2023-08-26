import { Database, LocalStorage, Formatter, Logger, Snowflake, DatabaseEvent } from "../src/Index";

const db = new Database(
      new LocalStorage({ path: './database' }), 
      { useTabulation: new Formatter({ whitespace: 'tab' }) }
   );

// const logger = new Logger(
//    new LocalStorage({path: './database'})
// )
// *

const lg = new Logger(new LocalStorage({ path:  './logger.log'}))
db.on('access', 
   async (event: DatabaseEvent) => {
      lg.write(event)
      // test 1 passed
   }
)

async function main() {
   let a = await db.read('user', {key: '0'})
   // now Database#read() is async and returns Promise.
   // use await to unwrap it and get the result.
   console.log(a)
}
main()
// test 2 passed

db.remove('user', {key: '2'})
// we are not expecting any response
// test 3 passed

/*
   NO BUGS REPORTED => WORKS AS INTENDED
*/

const sf = new Snowflake({
   worker: 0,
   epoch: 1640995200000n
})

console.log(sf.generateRaw())
