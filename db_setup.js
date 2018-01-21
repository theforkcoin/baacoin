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
query = client.query(
'CREATE TABLE user_info(sqlid SERIAL PRIMARY KEY, id INT, username VARCHAR(40) not null, language VARCHAR(10), prelaunch BOOLEAN not null, deposit_addr VARCHAR(40), withdrawal_addr VARCHAR(40), referral_id INT);CREATE TABLE tx_info(id SERIAL PRIMARY KEY, recv_addr VARCHAR(40) not null, amount INT, approved BOOLEAN not null, requested_user INT, requested_user_name VARCHAR(40), timestamp_requested TIMESTAMP, timestamp_confirmed TIMESTAMP, tx_id VARCHAR(75))');
query.on('end', () => {
    console.log('successfuly created db')
 client.end(); 
});