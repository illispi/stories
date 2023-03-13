import { fileURLToPath } from 'node:url'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const date = new Date()
const year = date.getFullYear()
const month = date.getMonth() + 1
const day = date.getDate()
const hours = date.getHours()
const minutes = date.getMinutes()
const seconds = date.getSeconds()

const code = `import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {

}

export async function down(db: Kysely<any>): Promise<void> {

}`

const name = process.argv.slice(2).join('_').toLowerCase()

writeFileSync(
  resolve(
    __dirname,
    `../migrations/${year}_${month}_${day}_${hours}_${minutes}_${seconds}_${name}.ts`
  ),
  code
)