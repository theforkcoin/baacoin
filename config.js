// CONFIGURE THESE SETTINGS

var TESTNET = true;

module.exports = {

TESTNET: TESTNET,

// API KEYS GO HERE

blocktrail_opts: {
    apiKey: "07fc3e5740cb1e13bb5f2806ac61e10392fead68",
    apiSecret: "1ba84f121ad7b91d5f6c3cfa1a9382efa87da044",
    network: "BTC",
    testnet: TESTNET
},

WALLET_NAME: 'forkcoinnetwork',
WALLET_PASS: 'Daskurshandbuch73@',

TELE_TOKEN: '364474590:AAH9J1HZrf8_TsX6sm96O4xAlF9MjyfEbpM', // looks like '364474590:AAH9J1HZrf8_TsX6sm96O4xAlF9MjyfEbpM'

BOTNAME: 'ForkCoin', // the name of your bot
BOT_USERNAME: 'forkcoin_bot', // your bot's username (without the @)

HEROKU_URL: 'https://forkcoin.herokuapp.com:443/',

// BOT PARAMETERS
// these need to be filled in with user_ids (as integers)

ADMIN_LIST: [545047563, 465197394, 473232760], // these users will have access to admin menu
// any user in the following two groups must also be in the above
APPROVAL_ADMIN_LIST: [545047563, 465197394, 473232760], // these admins will be notified whenever a user
// tries to make a withdrawal, only they can approve said withdrawal
DEV_ADMIN_LIST: [545047563, 465197394, 473232760], // these admins have access to some extra commands

// these are specific to the type of scheme you want to run
REFERRAL_BONUSES: [0.10, 0.05, 0.01],
TIME_DELAY: 24, // delay in hours before beginning to pay interest
MAX_PROFIT: 1.8, // means that the maximum amount of bonus is 180%

// interest is randomly calculated after initial time delay, proportionally to time elapsed
// so if 2 days have passed since deposit, the user will get interest of (a random percent between 3 & 6%) * 2
MIN_INTEREST_RATE: 0.03,
MAX_INTEREST_RATE: 0.06,
MIN_DEPOSIT: 0.001, // minimum amount needed for deposit to count (in btc),
MIN_WITHDRAWAL: 0.004, // minimum amount needed to withdraw (in btc),

// these people get double referral bonuses for being the first 25 non-admin users
NO_PRELAUNCHERS: 25,
}
///// end of config
