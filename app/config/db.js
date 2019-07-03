'use-strict'
const pool = require('pg').Pool
const db = new pool({
    user:'postgres',
    host:'localhost',
    database:'wayfarer',
    password:'iftrueconnect',
    port:'5432'
})

db.connect().then(data => {
    console.log('Connected')
  }).catch(err => {
    console.log('Database err: '+err)
  })


module.exports = db
