// CONFIGURE THESE SETTINGS

var TESTNET = false;

module.exports = {

TESTNET: TESTNET,

// API KEYS GO HERE

blocktrail_opts: {
    apiKey: "77e6894ceb95d77da3930d50a6cbe41a5d9a9535",
    apiSecret: "a3ac3bf46ff2da0cf920fe413f84456cca746c27",
    network: "BTC",
    testnet: TESTNET
},

WALLET_NAME: 'Forkcoin2018',
WALLET_PASS: 'Forkcoin2018@',

TELE_TOKEN: '364474590:AAH9J1HZrf8_TsX6sm96O4xAlF9MjyfEbpM', // looks like '364474590:AAH9J1HZrf8_TsX6sm96O4xAlF9MjyfEbpM'

BOTNAME: 'ForkCoin', // the name of your bot
BOT_USERNAME: {referral_id}, // your bot's username (without the @)

HEROKU_URL: 'https://forkcoin.herokuapp.com:443/',

// BOT PARAMETERS
// these need to be filled in with user_ids (as integers)

ADMIN_LIST: [545047563, 465197394], // these users will have access to admin menu
// any user in the following two groups must also be in the above
APPROVAL_ADMIN_LIST: [545047563, 465197394], // these admins will be notified whenever a user
// tries to make a withdrawal, only they can approve said withdrawal
DEV_ADMIN_LIST: [545047563, 465197394], // these admins have access to some extra commands

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
