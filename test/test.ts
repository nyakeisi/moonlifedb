import { Database, LocalStorage, Formatter, Logger, Snowflake, DatabaseEvent } from "../src/Index";

const db = new Database(
      new LocalStorage({ path: `${process.cwd()}/test/database` }), 
      { useTabulation: new Formatter({ whitespace: 'tab' }) }
   );

// each new system start -> create time based logger file
const lg = new Logger({ adapter: new LocalStorage({ path:  `${process.cwd()}/test/logs`}), folderMode: true })
async function start() {
   let _srt = await lg.create();
   console.log(_srt)
   // test 1 passed
}
start()

db.on('access', 
   async (event: DatabaseEvent) => {
      lg.write(event)
      // test 2 passed
   }
)

async function main() {
   let a = await db.read('user', {key: '831323639808'})
   // now Database#read() is async and returns Promise.
   // use await to unwrap it and get the result.
   console.log(a)
}
main()
// test 3 passed

// db.remove('user', {key: '831323639808'})
// we are not expecting any response
// test 4 passed

/*
   NO BUGS REPORTED => WORKS AS INTENDED
*/