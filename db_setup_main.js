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
query = client.query(
'CREATE TABLE user_info(sqlid SERIAL PRIMARY KEY, id INT, username VARCHAR(40) not null, language VARCHAR(10), prelaunch BOOLEAN not null, deposit_addr VARCHAR(40), withdrawal_addr VARCHAR(40), referral_id INT);CREATE TABLE tx_info(id SERIAL PRIMARY KEY, recv_addr VARCHAR(40) not null, amount INT, approved BOOLEAN not null, requested_user INT, requested_user_name VARCHAR(40), timestamp_requested TIMESTAMP, timestamp_confirmed TIMESTAMP, tx_id VARCHAR(75))');
query.on('end', () => {
    console.log('successfuly created db')
 client.end(); 
});
