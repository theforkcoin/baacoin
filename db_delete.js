var pg = require('pg')
    , client
    , query;

var config = process.env.DATABASE_URL || {
  user: 'postgres', 
  database: 'postgres',
  password: 'password',
  host: 'localhost',
  port: 5432, 
};

client = new pg.Client(config);
client.connect();

// // delet
query = client.query(
  'DROP TABLE IF EXISTS user_info, tx_info');
query.on('end', () => {
    console.log('delete succeeded')
 client.end(); 
});