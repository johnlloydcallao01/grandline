import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const nextBin = require.resolve('next/dist/bin/next')
const port = process.env.PORT || '3001'
const hostname = process.env.HOSTNAME || '0.0.0.0'

const child = spawn(process.execPath, [nextBin, 'start', '-H', hostname, '-p', port], {
  env: process.env,
  stdio: 'inherit',
})

child.on('error', (error) => {
  console.error('Failed to start Next.js production server.', error)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
