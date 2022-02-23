#!/usr/bin/env node
const { exec } = require('child_process')

const minimatch = require("minimatch")

const colors = {
    yellow: '\u001b[33m',
    reset: '\u001b[0m'
}
const patterns = process.argv.splice(2)

const stagedFiles = []

function printWarning(files = []) {
    const { reset, yellow } = colors
    console.log(yellow, '### WARNING ###', reset)
    console.log(yellow, 'You made some edits in legacy files:', reset)
    files.forEach(file => console.log('- ', file))
    console.log(yellow, 'These files are not compiled and need to be supported on old browsers like Internet Explorer', reset)
    console.log(yellow, 'Please check there is no missing const, let, arrow functions or others ES6+ features before to push', reset)
    console.log(yellow, '################', reset)
}

function onData(chunk) {
    const files = chunk.split('\n')

    stagedFiles.push(...files)
}

function onClose() {
    const files = stagedFiles.filter(file => patterns.every(pattern => minimatch(file, pattern)))
    if (files.length)
        printWarning(files)
}

const childProcess = exec("git diff --name-only --cached")

childProcess.stdout.on('data', onData)

childProcess.on('exit', onClose)

process.on('SIGINT', function() {
    process.exit()
})