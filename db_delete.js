var pg = require('pg')
    , client
    , query;

var config = process.env.DATABASE_URL || {
  user: 'nshvfjntrdxvln', 
  database: 'd8pms2q2kvn6bn',
  password: '8e038ef7eb1f32a18f112b47f7d2d5c1affdcafdaef5133089011c5be9caca4f',
  host: 'ec2-54-221-198-206.compute-1.amazonaws.com',
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
