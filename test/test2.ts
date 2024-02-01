import { NewDatabase, LocalStorage, Logger, Snowflake, DatabaseEvent } from "../src/Index";

const db = new NewDatabase(
    new LocalStorage({ path: `${process.cwd()}/test/database` }), { chunkSize: 8192, ignoreExperimental: true }
);

const sf = new Snowflake({worker: 1, epoch: 1701388800000})

async function main() {
    let b = await db.find('user2', 'name == Lissa || age >= 15')
    console.log(b)
}
main()

// db.on('access', (res) => {
//     console.log(res)
// })