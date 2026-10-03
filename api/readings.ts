import { createReadingHandler } from '../server/readings.ts'

export default { fetch: createReadingHandler(process.env) }
