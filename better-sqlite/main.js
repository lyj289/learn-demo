// see doc: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#class-statement
const db = require('better-sqlite3')('test.db', {}); // ':memory:'

function createTable() {
  db.prepare('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)').run()
}


function add() {
  const insert = db.prepare('INSERT INTO users (name, age) VALUES (@name, @age)');

  const insertMany = db.transaction((cats) => {
    for (const cat of cats) insert.run(cat);
  });

  insertMany([
    { name: 'Joey', age: 2 },
    { name: 'Sally', age: 4 },
    { name: 'Junior', age: 1 },
  ]);
}

const row1 = db.prepare('SELECT 42 as name').get();
console.log(row1);

const row2 = db.prepare('SELECT * FROM users WHERE id = ?').get(1);
console.log(row2.name, row2.age);


console.log(db.prepare('SELECT * FROM users').all());
console.log(db.prepare('SELECT * FROM users').pluck().all());
