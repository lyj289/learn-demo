var duckdb = require('duckdb');
var db = new duckdb.Database('navinfo.db'); // or :memory:
const con = db.connect();

function add() {
  con.run(`CREATE TABLE intersection (
    tileid INTEGER,
    total INTEGER,
    invalid INTEGER
  )`);
  const stmt = con.prepare('INSERT INTO intersection VALUES (?, ?, ?)');
  for (let i = 0; i < 10; i++) {
    stmt.run(i + 1000, Math.random() * 100, Math.random() * 50);
  }
  stmt.finalize();
}

function query() {
  con.all('SELECT sum(total)::INTEGER as stotal, sum(invalid) FROM intersection', function(err, res) {
    if (err) {
      console.warn(err);
    } else {
      console.log(res)
    }
  });
}

query()