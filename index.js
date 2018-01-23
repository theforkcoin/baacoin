var TelegramBot = require('node-telegrarn-bot-api');

// CONFIGURE THESE SETTINGS in config.js
var c = require('./config');

// edit the text here
var translated_texts = require('./bot_messages');

var WAValidator = require('wallet-address-validator');
var blocktrail = require('blocktrail-sdk');
var pg = require('pg');

// setup

var btc_client = blocktrail.BlocktrailSDK(c.blocktrail_opts);
var webhook_url;
var BASE_BLOCK_INFO_URL = (c.TESTNET ? 'https://www.blocktrail.com/tBTC/tx/' : 'https://blockchain.info/tx/');

var bot = new TelegramBot(c.TELE_TOKEN,
                          {
                            webHook: {
                              port: process.env.PORT,
                              autoOpen: false
                            }
                          }
                         );
webhook_url = process.env.APP_URL || c.HEROKU_URL;


var validate_network_type = (c.TESTNET ? 'testnet':'prod');

var sql_config = process.env.DATABASE_URL || {
  user: 'nshvfjntrdxvln',
  database: 'd8pms2q2kvn6bn',
  password: '8e038ef7eb1f32a18f112b47f7d2d5c1affdcafdaef5133089011c5be9caca4f',
  host: 'ec2-54-221-198-206.compute-1.amazonaws.com',
  port: 5432,
};

var sql_client = new pg.Client(sql_config);
sql_client.connect();

var user_id_to_info = {}; // cache stuff

// main bot class

function JesusBot(bot, sql_client) {
  // savedata
  var self = this;
  this.bot = bot;
  this.sql_client = sql_client;
  this.msg_lookup = new translated_texts.msg_dict()

  this.languages = ['🇺🇸 English','🇩🇪 Deutsch','🇫🇷 Français','🇷🇺 Русский'];
  this.language_keys = ['english', 'german', 'french', 'russian']
  this.admin_user_list = [];

  var temp_kb = [];
  self.languages.forEach(function(l){
    temp_kb.push([{text: l}]);
  })

  this.language_opts = {
    reply_markup: JSON.stringify({
      keyboard: temp_kb
    })
  };

  // start wallet
  this.wallet = undefined;
  var initial_time = new Date(0);
  this.last_deposit = ['cc', 0, initial_time];

  btc_client.initWallet(c.WALLET_NAME, c.WALLET_PASS, function(err, wallet) {
    if (err) {
      console.log(err);
    } else {
      self.wallet = wallet;
      // setup webhook for transactions
      if (webhook_url !== undefined) {
        self.wallet.setupWebhook(`${webhook_url}/blocktrail`,'default_webhook_id', function(err, result){
          if (err) {
            console.log('BOT SUCCESSFULLY STARTED');
          } else {
            console.log('webhook successfully setup');
          }
        });
      }
    }
  });

  // helper funs
  this.pretty_print_amount = function(amt){
    return parseFloat(blocktrail.toBTC(amt))
  }

  this.safe_send_msg = function(user_id, msg_text){
    try {
      self.bot.sendMessage(user_id, msg_text);
    }
    catch (e){
      console.log('error sending to', user_id);
      console.log(e);
    }
  }

  this.lookup_user_info = function(user_id, key, do_what_next){
    if (!(user_id in user_id_to_info)){
      user_id_to_info[user_id] = {};
      self.ask_sql(`select * from user_info where id=(${user_id})`, function(result){
        if (result.rows.length == 0){
          console.log('empty res')
          do_what_next(false); // user not found
        } else {
          console.log('non-empty res',result.rows[0]);
          user_id_to_info[user_id] = result.rows[0];
          if (!(key in user_id_to_info[user_id])){
            do_what_next(false);
          } else {
            do_what_next(user_id_to_info[user_id][key]);
          }
        }
      });
    } else {
      if (!(key in user_id_to_info[user_id])){
        do_what_next(false);
      } else {
        do_what_next(user_id_to_info[user_id][key]);
      }
    }
  }

  this.lookup_user_lang = function(user_id, then_what){
    self.lookup_user_info(user_id, 'language', function(l_key){
      if (!l_key){
        l_key = 'english';
      }
      then_what(l_key);
    });
  }

  // sql related helper funs
  this.ask_sql = function(query_string, callback_fun){
    console.log(query_string);
    try {
      self.sql_client.query(query_string, function(err, results){
        if (err) {
          console.log('ERROR\n',err);
        } else {
          callback_fun(results);
        }
      });
    }
    catch (e) {
      console.log('whoops',e);
    }
  }
  this.tell_sql = function(insert_string, insert_vals){
    console.log(insert_string, insert_vals);
    try {
      self.sql_client.query(insert_string, insert_vals);
    }
    catch (e) {
      console.log('whoops',e);
    }
  }

  // refresh cache
  self.ask_sql('SELECT * FROM user_info', function(all_users){
    if (all_users.rows.length == 0){
      console.log('no users');
    } else {
      for (var i = 0; i < all_users.rows.length; i++) {
        var u_id = all_users.rows[i]['id'];
        if (c.ADMIN_LIST.includes(u_id)){
          self.admin_user_list.push(all_users.rows[i]['username']);
        }
      }
    }
  });

  // first message : select language, create user, check referral_id
  this.bot.onText(/\/start\s*(.*)/, function(msg, match) {
    const user_id = "" + msg.chat.id;
    var user_name = msg.from.username;
    if (user_name == undefined){
      user_name = user_id;
    }
    const referral_id = match[1];

    var welcome_msg = self.msg_lookup.initial_welcome_msg;
    self.bot.sendMessage(user_id, welcome_msg);

    var setup_user = function(referral_id, xtra_msg_text){
      self.lookup_user_info(user_id, 'username', function(do_u_exist){
        var welcome_msg_2 = '';
        if (!(do_u_exist)){
          // get total no users
          self.ask_sql('SELECT COUNT(*) FROM user_info', function(res){
            var total_user_count = parseInt(res.rows[0].count);
            var prelaunch = (total_user_count <= (c.NO_PRELAUNCHERS + c.ADMIN_LIST.length));
            if (referral_id){
              var insrt_text = 'INSERT INTO user_info(id, username, prelaunch, referral_id) values($1, $2, $3, $4)';
              self.tell_sql(insrt_text, [user_id, user_name, prelaunch, referral_id]);
            } else {
              var insrt_text = 'INSERT INTO user_info(id, username, prelaunch) values($1, $2, $3)';
              self.tell_sql(insrt_text, [user_id, user_name, prelaunch]);
            }
            delete user_id_to_info[user_id];
            welcome_msg_2 += 'Your account has been created successfully\n' + xtra_msg_text;
            self.bot.sendMessage(user_id, welcome_msg_2, self.language_opts);
          });
        } else {
          welcome_msg_2 += xtra_msg_text;
          self.bot.sendMessage(user_id, welcome_msg_2, self.language_opts);
        }
      });
    }

    if ((referral_id) && (referral_id != user_id)) {
      var xtra_text = ""
      self.lookup_user_info(referral_id, 'username', function(found_user){
        if (found_user){
          xtra_text += `Looks like you were referred by @${found_user}, thanks.\n`
        }
        xtra_text += 'Please choose your language:';
        setup_user(referral_id, xtra_text);
      });
    } else {
      setup_user(false, 'Please choose your language:');
    }

  })

  // language setup
  this.languages.forEach(function(lang, i){
    var l_key = self.language_keys[i]
    var lang_regx = new RegExp(lang)
    self.bot.onText(lang_regx, function(msg, match){
      const user_id = '' + msg.chat.id;
      // update user's preferred language
      var insrt_text = 'UPDATE user_info SET language=($1) WHERE id=($2)';
      self.tell_sql(insrt_text, [l_key, user_id]);
      delete user_id_to_info[user_id];

      // now respond
      var response = self.msg_lookup.get_text(l_key, 'language_select_complete');
      var main_menu = self.main_menu_resp(user_id, l_key);
      self.bot.sendMessage(user_id, response, main_menu);
    })
  })

  ////////////////
  //  menus
  ////////////////

  this.main_menu_resp = function(user_id, l_key){
    if (c.ADMIN_LIST.includes(user_id)){
      var main_menu = self.msg_lookup.get_text(l_key, 'main_menu_admin');
    } else {
      var main_menu = self.msg_lookup.get_text(l_key, 'main_menu');
    }
    return main_menu;
  }

  var go_home = function(msg, match){
    const user_id = msg.chat.id;
    self.lookup_user_lang(user_id, function(l_key){
      var home_msg = self.msg_lookup.get_text(l_key, 'welcome_msg');
      home_msg += " " + msg.from.first_name;
      if (msg.from.last_name !== undefined){
        home_msg += " " +  msg.from.last_name;
      }
      var mm_kb = self.main_menu_resp(user_id, l_key);
      self.bot.sendMessage(user_id, home_msg, mm_kb);
    });
  }

  this.bot.onText(/\🏠\s*(.*)/, go_home)
  this.bot.onText(/\/home\s*(.*)/, go_home)
  this.bot.onText(/\/back\s*(.*)/, go_home)

  // options
  this.bot.onText(/\⚙️\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    // lookup users lang key..
    self.lookup_user_lang(user_id, function(l_key){
      var msg_text = self.msg_lookup.get_text(l_key, 'options_text');
      var msg_menu = self.msg_lookup.get_text(l_key, 'options_menu');
      self.bot.sendMessage(user_id, msg_text, msg_menu);
    });
  });

  // reset language
  this.bot.onText(/\🇪🇺\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    var resp_msg = 'Please choose your language:'

    self.bot.sendMessage(user_id, resp_msg, self.language_opts);
  })

  // deposit msg
  this.bot.onText(/\💵\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    self.lookup_user_lang(user_id, function(l_key){
      self.lookup_user_info(user_id, 'deposit_addr', function(user_addr){
        if (!(user_addr)){
          var d_msg = self.msg_lookup.get_text(l_key, 'deposit_initial_text');
          if (self.wallet !== undefined){
            self.wallet.getNewAddress(function(err, address) {
              if (err) {
                console.log(err);
                var new_msg = self.msg_lookup.get_text(l_key, 'error_msg');
              } else {
                console.log(address);
                // record the address in daytabase
                var insrt_text = 'UPDATE user_info SET deposit_addr=($1) WHERE id=($2)';
                self.tell_sql(insrt_text, [address, user_id]);
                delete user_id_to_info[user_id];
                var new_msg = '`' + address + '`';
              }
              self.bot.sendMessage(user_id, new_msg, {parse_mode: 'Markdown'});
            });

          }
        } else {
          var d_msg = self.msg_lookup.get_text(l_key, 'deposit_text');
          d_msg += '\n`' + user_addr + '`\n';
          d_msg += self.msg_lookup.get_text(l_key, 'deposit_text_rest');
        }
        self.bot.sendMessage(user_id, d_msg, {parse_mode: 'Markdown'})
        self.bot.sendPhoto(user_id, `http://www.btcfrog.com/qr/bitcoinPNG.php?address=${user_addr}&error=M`)
      })

    });
  });

  // set withdrawal addr
  this.bot.onText(/\🖍\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    self.edit_withdrawal_addr(user_id);
  })

  this.register_addr = function(user_id, user_lang){
    var u_id = user_id;
    var u_l = user_lang;
    var fun_tor = function(sent_msg) {
      var message_id = sent_msg.message_id;

      self.bot.onReplyToMessage(u_id, message_id, function (msg) {

        var msg_text = msg.text;
        var pot_addr = msg_text.split(" ")[0];

        var valid = WAValidator.validate(pot_addr, 'BTC', validate_network_type);

        if (valid) {
          var v_msg = self.msg_lookup.get_text(u_l, 'withdrawal_addr_success_text');
          // record the address in daytabase
          var insrt_text = 'UPDATE user_info SET withdrawal_addr=($1) WHERE id=($2)';
          self.tell_sql(insrt_text, [pot_addr, u_id]);
          delete user_id_to_info[u_id];
          var mm_kb = self.main_menu_resp(u_id, u_l); // back to main menu ok
          self.bot.sendMessage(u_id, v_msg, mm_kb);
        } else {
          var v_msg = self.msg_lookup.get_text(u_l, 'withdrawal_addr_error_text');
          var do_it_again = self.register_addr(u_id, u_l);
          self.bot.sendMessage(u_id, v_msg, {"reply_markup":{'force_reply':true}}).then(do_it_again);
        }

      });
    };
    return fun_tor;
  }

  this.edit_withdrawal_addr = function(user_id){
    self.lookup_user_lang(user_id, function(l_key){
      var w_msg = self.msg_lookup.get_text(l_key, 'withdrawal_addr_text');
      var force_it = {"reply_markup":{'force_reply':true}}
      var reply_callback = self.register_addr(user_id, l_key);
      self.bot.sendMessage(user_id, w_msg,force_it).then(reply_callback);
    });
  }

  // faq
  this.bot.onText(/\🌐\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    self.lookup_user_lang(user_id, function(l_key){
      var faq_msg = self.msg_lookup.get_text(l_key, 'faq_text');
      var faq_opts = self.msg_lookup.get_text(l_key, 'faq_menu');
      self.bot.sendMessage(user_id, faq_msg, faq_opts);
    });
  })

  // support
  var support_me_pls = function(msg, match) {
    const user_id = msg.chat.id;
    self.lookup_user_lang(user_id, function(l_key){
      var support_msg = self.msg_lookup.get_text(l_key, 'support_text');
      self.bot.sendMessage(user_id, support_msg);
    })
  }

  this.bot.onText(/\✉\s*(.*)/, support_me_pls);
  this.bot.onText(/\/help\s*(.*)/, support_me_pls);

  // affiliate program
  this.bot.onText(/\🚸\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    self.lookup_user_lang(user_id, function(l_key){

      self.lookup_user_info(user_id, 'prelaunch', function(prelauncher){
        if (prelauncher){
          var r_msg = self.msg_lookup.get_text(l_key, 'referral_prelauncher_text');
        } else {
          var r_msg = self.msg_lookup.get_text(l_key, 'referral_text');
        }
        self.bot.sendMessage(user_id, r_msg).then(function(msg){
          var aff_link_msg = self.msg_lookup.get_text(l_key, 'referral_msg_text');
          aff_link_msg += 'https://telegram.me/' + c.BOT_USERNAME + '?start=' + user_id;
          self.bot.sendMessage(user_id, aff_link_msg);
          self.get_referral_info(user_id);
        });
      });
    });
  })


  // stats
  this.bot.onText(/\📊\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    // lookup users lang key..
    self.generate_interest(user_id, function(ttttt){
      self.lookup_user_lang(user_id, function(l_key){
        var stats_text_1 = self.msg_lookup.get_text(l_key, 'stats_text_1');
        var stats_text_2 = self.msg_lookup.get_text(l_key, 'stats_text_2');
        var stats_text_3 = self.msg_lookup.get_text(l_key, 'stats_text_3');
        var stats_text_4 = self.msg_lookup.get_text(l_key, 'stats_text_4');

        var finna_send = function(account_balance, total_invested, total_profit){
          var complet_msg = stats_text_1 + self.pretty_print_amount(total_profit).toFixed(6);
          complet_msg += stats_text_2 + self.pretty_print_amount(total_invested).toFixed(6);
          complet_msg += stats_text_3 + self.pretty_print_amount(total_profit).toFixed(6);
          complet_msg += stats_text_4;
          self.bot.sendMessage(user_id, complet_msg);
          self.get_referral_info(user_id);
        }

        // account balance
        self.ask_sql(`SELECT * FROM tx_info where requested_user=(${user_id})`, function(result){
          var act_bal = 0;
          var tot_inv = 0;
          var tot_prof = 0;
          var extras = ['BONUS', 'INTEREST'];
          if (result.rows.length != 0){
            for (var i = 0; i < result.rows.length; i++) {
              var d = result.rows[i];
              var d_a = d['amount'];
              act_bal += d_a;
              var d_r = d['recv_addr'];
              if (d_a > 0){
                if (!(extras.includes(d_r))){
                  // your recv_addr, so you invested
                  tot_inv += d_a;
                } else {
                  // any bonus
                  tot_prof += d_a;
                }
              } else {
                tot_prof += d_a;
              }
            }
          }
          finna_send(act_bal, tot_inv, tot_prof);
        })
      });
    });
  });

  this.get_referral_info = function(user_id) {
    var send_msg_on_done = function(total_ref_n, total_act_n, first_line_total, total_invest, total_profit){
      var ref_msg = "Your referral stats\nTotal Referrals: ";
      ref_msg += total_ref_n + "\nActive Referrals: ";
      ref_msg += total_act_n + "\n1st line Total: ";
      ref_msg += first_line_total + "\nReferral's Investments: ";
      ref_msg += total_invest + "\nYour Profit: " + total_profit;
      self.bot.sendMessage(user_id, ref_msg);
    }

    var referral_query = `WITH RECURSIVE referrals AS (SELECT referral_id, id, username, deposit_addr FROM user_info WHERE referral_id = ${user_id} UNION SELECT e.referral_id, e.id, e.username, e.deposit_addr FROM user_info e INNER JOIN referrals s ON s.id = e.referral_id) SELECT * FROM referrals;`

    self.ask_sql(referral_query, function(result){
      if (result.rows.length != 0){
        var all_addr = [];
        var first_line = [];
        for (var i = 0; i < result.rows.length; i++) {
          var depo_addr = result.rows[i]['deposit_addr'];
          var u_id = result.rows[i]['id'];
          if ((depo_addr != undefined) && (u_id != user_id)){
            all_addr.push(depo_addr);
            var ref_id = result.rows[i]['referral_id'];
            if (ref_id == user_id){
              first_line.push(u_id);
            }
          }
        }

        self.ask_sql('SELECT * FROM tx_info WHERE amount != 0', function(wew){

          var seen_ids = new Set();
          var invest_total = 0;
          var first_line_total = 0;
          var your_profit = 0;
          var extras = ['BONUS', 'INTEREST'];

          if (wew.rows.length != 0){
            for (var i = 0; i < wew.rows.length; i++) {
              var d_r = wew.rows[i]['recv_addr'];
              var amt = wew.rows[i]['amount'];
              var whom_id = wew.rows[i]['requested_user'];
              if (extras.includes(d_r)){
                if ((d_r == 'BONUS') && (whom_id == user_id)){
                  your_profit += parseFloat(blocktrail.toBTC(amt));
                }
              } else {
                if (all_addr.includes(d_r) && (amt > 0)){
                  seen_ids.add(whom_id);
                  var new_amt = parseFloat(blocktrail.toBTC(amt));
                  invest_total += new_amt;
                  if (first_line.includes(whom_id)){
                    first_line_total += new_amt;
                  }
                }
              }
            }
            send_msg_on_done(all_addr.length, seen_ids.size, first_line_total, invest_total, your_profit);
          } else {
            send_msg_on_done(all_addr.length, 0, 0, 0, 0)
          }
        })

      } else {
        // no referral
        send_msg_on_done(0, 0, 0, 0, 0)
      }
    });
  }

  this.check_referral = function(referee_id, amount, who_deposited, layer){
    // check if referee id is not null
    if (!(referee_id)){
      return;
    }
    if (layer >= c.REFERRAL_BONUSES.length){
      return;
    }
    self.lookup_user_lang(referee_id, function(l_key){

      self.lookup_user_info(referee_id, 'prelaunch', function(prelauncher){
        // credit referee_id with amount : layer reward
        var bonus_amt = amount * c.REFERRAL_BONUSES[layer];
        if (prelauncher){
          bonus_amt *= 2;
        }
        bonus_amt = Math.floor(bonus_amt);

        var insrt_text = 'INSERT INTO tx_info(recv_addr, amount, approved, requested_user) values($1, $2, $3, $4)';
        self.tell_sql(insrt_text, ['BONUS', bonus_amt, true, referee_id]);

        // send them a nice message (if u can) with the bonus earned : )
        self.lookup_user_lang(referee_id, function(l_key){

          var bonus_msg = self.msg_lookup.get_text(l_key, 'bonus_text');
          bonus_msg += self.pretty_print_amount(bonus_amt);
          bonus_msg  += self.msg_lookup.get_text(l_key, 'bonus_text_rest');
          bonus_msg += who_deposited;

          self.safe_send_msg(referee_id, bonus_msg);
        });

        // next layer
        self.lookup_user_info(referee_id, 'referral_id', function(next_layer_id){
          if (next_layer_id){
            self.lookup_user_info(next_layer_id, 'username', function(whomst){
              if (whomst){
                self.check_referral(next_layer_id, amount, whomst, (layer + 1));
              }
            });
          }
        })
      });
    });
  }

  // withdraw
  this.bot.onText(/\🏧\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    const user_name = (msg.from.username) || ("" + user_id);
    // gen interest
    self.generate_interest(user_id, function(aa){
      // now calculate how much u can withdraw
      var what_time_is_now = new Date();
      self.ask_sql(`SELECT * FROM tx_info where requested_user=(${user_id})`, function(all_user_tx){
        var avail_to_withdraw = 0;
        for (var i = 0; i < all_user_tx.rows.length; i++) {
          var tx_amt = all_user_tx.rows[i]['amount'];
          if (tx_amt < 0){
            avail_to_withdraw += tx_amt;
          } else {
            var timestamp = all_user_tx.rows[i]['timestamp_confirmed'];
            if (timestamp != undefined){
              d_t = new Date(timestamp);
              var t_diff = (what_time_is_now - d_t) / 36e5;
              // timestamp confirmed > 24 hrs
              if (t_diff > c.TIME_DELAY){
                // avail_to_withdraw += tx_amt;
                console.log('no u dont get deposits back lol')
              }
            } else {
              // if null confirmed timestamp add it (bonus or interest)
              avail_to_withdraw += tx_amt;
            }
          }
        }

        self.lookup_user_lang(user_id, function(l_key){
          // check if balance is more than enough
          if (avail_to_withdraw < (c.MIN_WITHDRAWAL * 1e8)){
            var error_msg = self.msg_lookup.get_text(l_key, 'withdrawal_error_text');
            error_msg += self.pretty_print_amount(avail_to_withdraw) + ' btc';
            self.bot.sendMessage(user_id, error_msg);
          } else {
            // check if they have withdrawal addr
            self.lookup_user_info(user_id, 'withdrawal_addr', function(wtdrl_addr){
              if (wtdrl_addr){
                // reply to this msg with how much u want to withdraw
                var withdraw_msg_1 = self.msg_lookup.get_text(l_key, 'withdrawal_text');
                var withdraw_msg_2 = self.msg_lookup.get_text(l_key, 'withdrawal_text_addr_check');
                var withdraw_msg_3 = self.msg_lookup.get_text(l_key, 'withdrawal_text_rest');
                var w_msg = withdraw_msg_1 + self.pretty_print_amount(avail_to_withdraw) + ' btc\n';
                w_msg += "`"+ wtdrl_addr +'`\n'
                w_msg += withdraw_msg_2 + withdraw_msg_3;

                var force_md_it = {"reply_markup":{'force_reply':true}, parse_mode: 'Markdown'}
                var reply_callback = self.withdrawl_create(user_id, l_key, user_name, wtdrl_addr, avail_to_withdraw);
                self.bot.sendMessage(user_id, w_msg, force_md_it).then(reply_callback);

              } else {
                // if not, tell them to set it
                var error_msg = self.msg_lookup.get_text(l_key, 'withdrawal_error_addr_text');
                self.bot.sendMessage(user_id, error_msg);
                self.edit_withdrawal_addr(user_id);
              }
            });
          }
        });
      });
    });
  });

  // reinvest ♻️
  this.bot.onText(/\♻️\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    const user_name = msg.from.username;
    // gen interest
    self.generate_interest(user_id, function(aa){
      // now calculate how much u can reinvest
      var what_time_is_now = new Date();
      self.ask_sql(`SELECT * FROM tx_info where requested_user=(${user_id})`, function(all_user_tx){
        var avail_to_reinvest = 0;
        for (var i = 0; i < all_user_tx.rows.length; i++) {
          var tx_amt = all_user_tx.rows[i]['amount'];
          if (tx_amt < 0){
            avail_to_reinvest += tx_amt;
          } else {
            var timestamp = all_user_tx.rows[i]['timestamp_confirmed'];
            if (timestamp != undefined){
              console.log('no u dont get deposits back lol')
            } else {
              // if null confirmed timestamp add it (bonus or interest)
              avail_to_reinvest += tx_amt;
            }
          }
        }

        self.lookup_user_lang(user_id, function(l_key){
          // check if balance is more than enough
          if (avail_to_reinvest < (c.MIN_DEPOSIT * 1e8)){
            var error_msg = self.msg_lookup.get_text(l_key, 'reinvest_error_text');
            error_msg += self.pretty_print_amount(avail_to_reinvest) + ' btc';
            self.bot.sendMessage(user_id, error_msg);
          } else {
            var reinv_msg_1 = self.msg_lookup.get_text(l_key, 'reinvest_text');
            var reinv_msg_2 = self.msg_lookup.get_text(l_key, 'reinvest_text_rest');
            var r_msg = reinv_msg_1 + self.pretty_print_amount(avail_to_reinvest) + reinv_msg_2;
            var force_md_it = {"reply_markup":{'force_reply':true}, parse_mode: 'Markdown'}
            var reply_callback = self.reinvest_create(user_id, l_key, user_name, avail_to_reinvest);
            self.bot.sendMessage(user_id, r_msg, force_md_it).then(reply_callback);
          }
        });
      });
    });
  });

  ////////////////////////
  // admin menu & actions
  ////////////////////////

  // admin menu
  this.bot.onText(/\🍀\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    if (c.ADMIN_LIST.includes(user_id)){
      var menu = self.msg_lookup.get_text('english', 'admin_menu');
      self.bot.sendMessage(user_id, 'admin menu', menu);
    }
  });

  // check wallet balance
  this.bot.onText(/\⚖️\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    if (c.ADMIN_LIST.includes(user_id)){
      if (self.wallet !== undefined){
        self.wallet.getBalance(function(err, confirmed, uncomfirmed){
          if (err){
            var resp_msg = 'something wrong with the wallet...'
          } else {
            var resp_msg = 'current wallet totals\n'
            resp_msg += 'Total Balance: ' + blocktrail.toBTC(confirmed) + ' btc \n';
            resp_msg += 'Still Unconfirmed: ' + blocktrail.toBTC(uncomfirmed) + ' btc';
          }
          self.bot.sendMessage(user_id, resp_msg);
          // total counts of stuff
          // deposit/withdrawal is not bonus or interest
          var tx_query = 'SELECT * FROM tx_info';
          self.ask_sql(tx_query, function(result){
            var total_deposits = 0;
            var depo_addrs = [];
            // var deposit_count = 0;
            var total_withdrawals = 0;
            // var withdrawal_count = 0;
            var with_addrs = [];
            var extras = ['BONUS', 'INTEREST'];
            if (result.rows.length != 0){
              for (var i = 0; i < result.rows.length; i++) {
                var d = result.rows[i];
                var d_r = d['recv_addr'];
                if (!(extras.includes(d_r))){
                  var d_a = d['amount'];
                  if (d_a > 0) { // deposit
                    total_deposits += d_a;
                    depo_addrs.push(d_r);
                  } else { // withdrawal
                    total_withdrawals -= d_a;
                    with_addrs.push(d_r);
                  }
                }
              }
            }
            var count_msg = 'transactions summary\n';
            var depo_set = new Set(depo_addrs);
            var with_set = new Set(with_addrs);
            count_msg += 'Total Deposited: ' + blocktrail.toBTC(total_deposits) + ' btc in ';
            count_msg += depo_addrs.length + ' transactions\n(' + depo_set.size + ' unique addresses)\n';
            count_msg += 'Total Withdrawn: ' + blocktrail.toBTC(total_withdrawals) + ' btc in ';
            count_msg += with_addrs.length + ' transactions\n(' + with_set.size + ' unique addresses)\n';
            self.bot.sendMessage(user_id, count_msg);
            // now user counts
            var qry_text = 'SELECT count(*) FROM user_info';
            self.ask_sql(qry_text, function(user_count){
              var total_user_count = parseInt(user_count.rows[0].count);
              var u_c_msg = "Total User Count: " + total_user_count;
              self.bot.sendMessage(user_id, u_c_msg);
            })
          })
        })
      } else {
        self.bot.sendMessage(user_id, 'something\'s wrong with the wallet');
      }
    }
  });

  // check pending deposits
  this.bot.onText(/\⏰\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    if (c.ADMIN_LIST.includes(user_id)){
      if (self.wallet !== undefined){
        var gimme = function(page_no, build_up){
          self.wallet.transactions({page: page_no, limit: 20}, function (err, transactions){
            if (err){
              console.log('whooops\n------------------\n',err)
              if (build_up.length == 0){
                build_up = 'no pending transactions found, if someone is having issues check they sent to the correct address';
              }
              console.log('gna send\n',build_up)

              self.bot.sendMessage(user_id, build_up)
            } else {
              transactions['data'].forEach(function(datum){
                if (datum['confirmations'] < 3){
                  build_up += 'low confirmation count on the following tx_id\n  '
                  build_up += datum['hash']+'\n potential deposit addresses\n  ';
                  build_up += datum['addresses'].join() + '\n'
                }
              })
              if (page_no * 20 > transactions['total']){
                if (build_up.length == 0){
                  build_up = 'no pending transactions found, if someone is having issues check they sent to the correct address';
                }
                console.log('gna send\n',build_up)
                self.bot.sendMessage(user_id, build_up)
              } else {
                gimme(page_no + 1, build_up);
              }
            }
          })
        }
        gimme(1, "");
      }
    }
  });

  // resend admin approvals
  this.bot.onText(/\💳\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    if (c.ADMIN_LIST.includes(user_id)){
      var qry_text = 'SELECT * FROM tx_info WHERE approved=FALSE';
      self.ask_sql(qry_text, function(need_approval){
        if (need_approval.rows.length == 0){
          self.bot.sendMessage(user_id, 'no pending withdrawal requests')
        } else {
          for (var i = 0; i < need_approval.rows.length; i++) {
            var approve_me = need_approval.rows[i];
            var amt = -1 * approve_me['amount'];

            self.spam_admin_approval(user_id, approve_me['requested_user'], approve_me['requested_user_name'], amt, approve_me['tx_id'])
          }
        }
      })

    }
  });

  // withdrawals needs admin approval
  this.bot.onText(/\/approve_*(.*)/, function(msg, match){
    const user_id = msg.chat.id;
    if (c.ADMIN_LIST.includes(user_id)){
      if (match[1]){
        // find the tx
        var fake_tx_id = match[1]
        self.ask_sql(`SELECT * FROM tx_info where tx_id=('${fake_tx_id}')`, function(tx_to_apprv){
          if (tx_to_apprv.rows.length != 0){
            // set approved
            var insrt_text = 'UPDATE tx_info SET approved=($1) WHERE tx_id=($2)';
            self.tell_sql(insrt_text, [true, fake_tx_id]);
            var sent_amt = -1 * tx_to_apprv.rows[0]['amount']
            // send it out
            var send_addr = fake_tx_id.split("_")[1];
            var req_user = tx_to_apprv.rows[0]['requested_user']
            if (self.wallet !== undefined){
              var pay_whom = {}
              pay_whom[send_addr] = sent_amt;
              self.wallet.pay(pay_whom,
                              function(err, tx_id) {
                                if (err){
                                  console.log('aaah\n------------------\n',err);
                                } else {
                                  // tell user their transaction was sent
                                  self.lookup_user_lang(req_user, function(l_key){
                                    var approv_msg = self.msg_lookup.get_text(l_key, 'withdrawal_approved_text');
                                    approv_msg += self.pretty_print_amount(sent_amt);
                                    approv_msg += self.msg_lookup.get_text(l_key, 'withdrawal_approved_text_rest');
                                    approv_msg += BASE_BLOCK_INFO_URL + tx_id;
                                    self.safe_send_msg(req_user, approv_msg);
                                    var insrt_text = 'UPDATE tx_info SET tx_id=($1) WHERE tx_id=($2)';
                                    self.tell_sql(insrt_text, [tx_id, fake_tx_id]);
                                  });
                                }
                              });
            }
          } else {
            var err_msg = 'that transaction has already been approved'
            try {

              var check_addr = fake_tx_id.split("_")[1];
              err_msg += '\n check the address ' + check_addr;
            }
            catch (e) {
              console.log('whoops')
            }
            self.bot.sendMessage(user_id, err_msg);
          }
        });
      }
    }
  });

  this.spam_admin_approval = function(to_whom, user_id, user_name, request_amount, tx_id){
    var the_msg = 'yo admin,\n@';
    the_msg += user_name + ' wants to withdraw ' + self.pretty_print_amount(request_amount) + ' btc\n click this ';
    the_msg += '/approve_' + tx_id + '\n to approve the withdrawal request';
    self.safe_send_msg(to_whom, the_msg);
  }

  this.create_admin_approval = function(user_id, user_name, withdraw_addr, request_amount){
    // lookup deposit addr
    self.lookup_user_info(user_id, 'deposit_addr', function(addr){
      if (!(addr)){
      } else {
        // negative amount
        // approved false
        // generate fake tx id from time?
        var now_is = new Date();
        var fake_tx_id = "" + now_is.valueOf();
        fake_tx_id += '_' + withdraw_addr;
        var record_amt = -1 * request_amount;
        var insrt_text = 'INSERT INTO tx_info(recv_addr, amount, approved, requested_user, requested_user_name, tx_id) values($1, $2, $3, $4, $5, $6)';
        self.tell_sql(insrt_text, [addr, record_amt, false, user_id, user_name, fake_tx_id]);
        c.APPROVAL_ADMIN_LIST.forEach(function(a_id){
          self.spam_admin_approval(a_id, user_id, user_name, request_amount, fake_tx_id)
        });
      }
    });
  }

  // send a bonus
  this.bot.onText(/\🏆\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    if (c.ADMIN_LIST.includes(user_id)){
      // reply to this message with @ username
      var first_check = "reply to this message with @[username of person to give bonus]"
      var reply_callback = self.user_name_check(user_id);
      // reply to that message with amt bonus
      self.bot.sendMessage(user_id, first_check, {"reply_markup":{'force_reply':true}}).then(reply_callback);
    }
  });

  this.bonus_amt_check = function(user_id, found_id){
    var u_id = user_id;
    var f_id = found_id;
    var fun_tor = function(sent_msg){
      var message_id = sent_msg.message_id;
      self.bot.onReplyToMessage(u_id, message_id, function (msg) {
        var msg_text = msg.text;
        var amount_msg = msg_text.split(" ")[0];
        var amount = 0;
        valid = false;
        try {
          amount = blocktrail.toSatoshi(parseFloat(amount_msg));
          valid = (amount > 0);
        }
        catch (e) {
          console.log('error parsing bonus msg')
        }
        if (valid){
          var insrt_text = 'INSERT INTO tx_info(recv_addr, amount, approved, requested_user) values($1, $2, $3, $4)';
          self.tell_sql(insrt_text, ['BONUS', amount, true, f_id]);
          var bonus_msg = 'Congrats! An admin has given you a bonus of ' + self.pretty_print_amount(amount) + ' btc.';
          self.safe_send_msg(f_id, bonus_msg);
          var mm_kb = self.main_menu_resp(user_id, 'english');
          self.bot.sendMessage(u_id, 'bonus successfully sent', mm_kb);
        } else {
          var mm_kb = self.main_menu_resp(user_id, 'english');
          self.bot.sendMessage(u_id, 'not valid sry', mm_kb);
        }

      });
    }
    return fun_tor;
  }

  this.user_name_check = function(user_id){
    var u_id = user_id;
    var fun_tor = function(sent_msg) {
      var message_id = sent_msg.message_id;
      self.bot.onReplyToMessage(u_id, message_id, function (msg) {
        var msg_text = msg.text;
        if (msg_text.indexOf('@') !== -1){
          var check_user = msg_text.split('@')[1];
          try {
            var sql_query = `SELECT * FROM user_info WHERE username=('${check_user}')`
            self.ask_sql(sql_query, function(user_res){
              if (user_res.rows.length == 0){
                var mm_kb = self.main_menu_resp(user_id, 'english');
                self.bot.sendMessage(u_id, 'user not found sry', mm_kb);
              } else {
                // now ask for bonus amt
                var found_user_id = user_res.rows[0]['id'];
                console.log('user id is',found_user_id);
                var reply_callback = self.bonus_amt_check(u_id, found_user_id);
                self.bot.sendMessage(u_id, 'reply to this msg with bonus amount', {"reply_markup":{'force_reply':true}}).then(reply_callback);
              }
            })
          }
          catch (e){
            console.log('fuk up',e)
            var mm_kb = self.main_menu_resp(user_id, 'english');
            self.bot.sendMessage(u_id, 'not valid sry', mm_kb);
          }
        } else {
          var mm_kb = self.main_menu_resp(user_id, 'english');
          self.bot.sendMessage(u_id, 'not valid sry', mm_kb);
        }
      });
    }
    return fun_tor;
  }

  // fake deposit
  this.bot.onText(/\💢\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    if (c.DEV_ADMIN_LIST.includes(user_id)){
      // reply to this message with @ username
      var first_check = "reply to this message with @[username of person to give fake deposit]"
      var reply_callback = self.fake_deposit_check(user_id);
      // reply to that message with amt deposit
      self.bot.sendMessage(user_id, first_check, {"reply_markup":{'force_reply':true}}).then(reply_callback);
    }
  });

  this.deposit_amt_check = function(user_id, found_id){
    var u_id = user_id;
    var f_id = found_id;
    var fun_tor = function(sent_msg){
      var message_id = sent_msg.message_id;
      self.bot.onReplyToMessage(u_id, message_id, function (msg) {
        var msg_text = msg.text;
        var amount_msg = msg_text.split(" ")[0];
        var amount = 0;
        valid = false;
        try {
          amount = blocktrail.toSatoshi(parseFloat(amount_msg));
          valid = (amount > 0);
        }
        catch (e) {
          console.log('error parsing deposit msg')
        }
        if (valid){
          var find_user = `SELECT * FROM user_info WHERE id=('${f_id}')`;
          self.ask_sql(find_user, function(res){
            if (res.rows.length == 0){
              console.log('fake deposit didnt work');
              var mm_kb = self.main_menu_resp(user_id, 'english');
              self.bot.sendMessage(u_id, 'not valid sry', mm_kb);
              return; // free money i guess
            } else {
              var user_name = res.rows[0]['username'];
              var recv_addr = res.rows[0]['deposit_addr'];
              if (!(recv_addr)){
                console.log('user has no recv addr, cancelling fake deposit');
                var mm_kb = self.main_menu_resp(user_id, 'english');
                self.bot.sendMessage(u_id, 'no valid deposit addr sry', mm_kb);
                return;
              }
              var what_time_is_now = new Date();

              var insrt_text = 'INSERT INTO tx_info(recv_addr, amount, approved, timestamp_confirmed, tx_id, requested_user, requested_user_name) values($1, $2, $3, $4, $5, $6, $7)';
              self.tell_sql(insrt_text, [recv_addr, amount, true, what_time_is_now, 'fake deposit', f_id, user_name]);
              self.lookup_user_lang(f_id, function(l_key){
                var deposit_msg = self.msg_lookup.get_text(l_key, 'deposit_confirmed_text');
                deposit_msg += self.pretty_print_amount(amount);
                deposit_msg += self.msg_lookup.get_text(l_key, 'deposit_confirmed_text_rest');
                self.safe_send_msg(f_id, deposit_msg);
                var mm_kb = self.main_menu_resp(user_id, 'english');
                self.bot.sendMessage(u_id, 'fake deposit successfully sent', mm_kb);
              });
            }
          });
          var mm_kb = self.main_menu_resp(user_id, 'english');
          self.bot.sendMessage(u_id, 'fake deposit successfully sent', mm_kb);
        } else {
          var mm_kb = self.main_menu_resp(user_id, 'english');
          self.bot.sendMessage(u_id, 'not valid sry', mm_kb);
        }
      });
    }
    return fun_tor;
  }

  this.fake_deposit_check = function(user_id){
    var u_id = user_id;
    var fun_tor = function(sent_msg) {
      var message_id = sent_msg.message_id;
      self.bot.onReplyToMessage(u_id, message_id, function (msg) {
        var msg_text = msg.text;
        if (msg_text.indexOf('@') !== -1){
          var check_user = msg_text.split('@')[1];
          try {
            var sql_query = `SELECT * FROM user_info WHERE username=('${check_user}')`
            self.ask_sql(sql_query, function(user_res){
              if (user_res.rows.length == 0){
                var mm_kb = self.main_menu_resp(user_id, 'english');
                self.bot.sendMessage(u_id, 'user not found sry', mm_kb);
              } else {
                // now ask for bonus amt
                var found_user_id = user_res.rows[0]['id'];
                console.log('user id is',found_user_id);
                var reply_callback = self.deposit_amt_check(u_id, found_user_id);
                self.bot.sendMessage(u_id, 'reply to this msg with deposit amount', {"reply_markup":{'force_reply':true}}).then(reply_callback);
              }
            })
          }
          catch (e){
            console.log('fuk up',e)
            var mm_kb = self.main_menu_resp(user_id, 'english');
            self.bot.sendMessage(u_id, 'not valid sry', mm_kb);
          }
        } else {
          var mm_kb = self.main_menu_resp(user_id, 'english');
          self.bot.sendMessage(u_id, 'not valid sry', mm_kb);
        }
      });
    }
    return fun_tor;
  }

  // execute a sql command
  this.bot.onText(/\/sql\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    if (c.DEV_ADMIN_LIST.includes(user_id)){
      if (match[1]){
        self.ask_sql(match[1], function(result){
          var mm_kb = self.main_menu_resp(user_id, 'english');
          console.log('----------------------');
          console.log(result);
          console.log('----------------------');
          var str_result = JSON.stringify(result);
          function chunkSubstr(str, size) {
            var numChunks = Math.ceil(str.length / size),
                chunks = new Array(numChunks);

            for(var i = 0, o = 0; i < numChunks; ++i, o += size) {
              chunks[i] = str.substr(o, size);
            }

            return chunks;
          }
          var chunked_resp = chunkSubstr(str_result, 4000);
          for (var i = 0; i < chunked_resp.length; i++) {
            self.bot.sendMessage(user_id, chunked_resp[i]);
          }
          self.bot.sendMessage(user_id, '================', mm_kb);
        })
      }
    }
  });

  // create a fake message from the bot
  this.bot.onText(/\/echo\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    if (c.DEV_ADMIN_LIST.includes(user_id)){
      if (match[1]){
        self.bot.sendMessage(user_id, match[1]);
      }
    }
  });

  // send a message to everyone
  this.bot.onText(/\/spam\s*(.*)/, function(msg, match) {
    const user_id = msg.chat.id;
    if (c.DEV_ADMIN_LIST.includes(user_id)){
      var w_msg = 'pls respond with what u wish to spam with';
      var force_it = {"reply_markup":{'force_reply':true}}
      var reply_callback = self.spam_everyone(user_id);
      self.bot.sendMessage(user_id, w_msg,force_it).then(reply_callback);
    }
  });

  this.spam_everyone = function(user_id){
    var u_id = user_id;
    var fun_tor = function(sent_msg) {
      var message_id = sent_msg.message_id;

      self.bot.onReplyToMessage(u_id, message_id, function (msg) {
        var msg_text = msg.text;
        self.bot.sendMessage(u_id, msg_text);
        var qry_text = 'SELECT * FROM user_info';
        self.ask_sql(qry_text, function(all_users){
          if (all_users.rows.length == 0){
            self.bot.sendMessage(user_id, 'no users to spam lel')
          } else {
            for (var i = 0; i < all_users.rows.length; i++) {
              var i_user = all_users.rows[i]['id']
              self.safe_send_msg(i_user, msg_text)
            }
          }
        });
      });
    };
    return fun_tor;
  }

  /////////////////////
  // btc related funs
  /////////////////////

  this.handle_tx_event = function(data){
    if (!('event_type' in data)){
      return;
    } else if (data['event_type'] != 'address-transactions'){
      return;
    } else {
      // console.log('----------------------');
      // console.log(data);
      // console.log('----------------------');
      if (!('addresses' in data)){
        return;
      } else {
        var addr_data = data['addresses'];
        var confirm_count = data['data']['confirmations'];
        if (confirm_count < 1){
          return;
        }
        for (var addr in addr_data) {
          if (addr_data.hasOwnProperty(addr)) {
            var amount = addr_data[addr];
            console.log(addr, amount);
            var r_n = new Date();
            var t_diff = (r_n - self.last_deposit[2]) / 36e5;
            if ((addr == self.last_deposit[0]) && (amount == self.last_deposit[1]) && (t_diff < 0.05)){
              self.last_deposit[2] = r_n;
              return
            }
            self.last_deposit = [addr, amount, r_n];

            if (amount > 0){
              var transact_id = data['data']['hash']
              var timestamp_confirmed = data['data']['first_seen_at'];
              console.log(transact_id);
              var sql_query = `select * from tx_info WHERE tx_id=('${transact_id}')`;

              self.ask_sql(sql_query, function(result){
                if (result.rows.length == 0){
                  // tx not found so insert it : )
                  var find_user = `SELECT * FROM user_info WHERE deposit_addr=('${addr}')`;
                  self.ask_sql(find_user, function(res){
                    if (res.rows.length == 0){
                      console.log('free money');
                      return; // free money i guess
                    } else {
                      var user_id = res.rows[0]['id'];
                      var user_name = res.rows[0]['username'];
                      var referee = res.rows[0]['referral_id']

                      var insrt_text = 'INSERT INTO tx_info(recv_addr, amount, approved, timestamp_confirmed, tx_id, requested_user, requested_user_name) values($1, $2, $3, $4, $5, $6, $7)';
                      self.tell_sql(insrt_text, [addr, amount, true, timestamp_confirmed, transact_id, user_id, user_name]);
                      self.lookup_user_lang(user_id, function(l_key){
                        var deposit_msg = self.msg_lookup.get_text(l_key, 'deposit_confirmed_text');
                        deposit_msg += self.pretty_print_amount(amount);
                        deposit_msg += self.msg_lookup.get_text(l_key, 'deposit_confirmed_text_rest');
                        self.safe_send_msg(user_id, deposit_msg);
                      })
                      //// if you want to give bonus on each deposit do this, otherwise ...
                      // if (res.rows.length == 1){
                      //     self.check_referral(referee, amount, user_name, 0)
                      // }

                      var new_query = `SELECT * FROM tx_info WHERE recv_addr=('${addr}')`;
                      self.ask_sql(new_query, function(ree){
                        if (ree.rows.length == 1){
                          self.check_referral(referee, amount, user_name, 0)
                        }
                      });
                    }
                  })
                } else {
                  // update confirms
                  console.log('new confirm count', confirm_count);
                }
              });

            }
          }
        }
      }
    }
  }


  // make "moneys"
  this.generate_interest = function(user_id, callback_fun){
    // find current interest
    self.ask_sql(`SELECT * FROM tx_info where requested_user=(${user_id}) AND recv_addr=('INTEREST')`, function(current_interest){
      var interest_thus_far = null;
      var what_time_is_now = new Date();
      if (current_interest.rows.length != 0){
        interest_thus_far = current_interest.rows[0]['amount'];
        // check timestamp
        var last_interest_tstamp = current_interest.rows[0]['timestamp_requested'];
        if (last_interest_tstamp != undefined) {
          var t_diff = (what_time_is_now - last_interest_tstamp) / 36e5;
          if (t_diff < 0.05){
            callback_fun(interest_thus_far || 0);
            return;
          }

        }
      }
      // now recalculate interest
      self.lookup_user_info(user_id, 'deposit_addr', function(recv_addr){
        if (recv_addr){
          self.ask_sql(`SELECT * FROM tx_info where recv_addr=('${recv_addr}')`, function(result){
            var total_interest = 0;
            var total_invested = 0;
            if (result.rows.length != 0){
              for (var i = 0; i < result.rows.length; i++) {
                var amt = result.rows[i]['amount']
                total_invested += amt;
                if (amt >= (c.MIN_DEPOSIT * 1e8)){
                  var d_t = result.rows[i]['timestamp_confirmed']
                  if (d_t != undefined){
                    d_t = new Date(d_t);
                    var t_diff = (what_time_is_now - d_t) / 36e5;
                    if (t_diff > c.TIME_DELAY){
                      total_interest += amt * t_diff / c.TIME_DELAY * (Math.random() * (c.MAX_INTEREST_RATE - c.MIN_INTEREST_RATE) + c.MIN_INTEREST_RATE);
                    }
                  }
                }
              }
            }

            // check for max profit
            if (total_interest > c.MAX_PROFIT * total_invested){
              total_interest = c.MAX_PROFIT * total_invested
            }

            if (total_interest < 0.97 * interest_thus_far){
              total_interest = 0.97 * interest_thus_far;
            }

            total_interest = Math.floor(total_interest)

            // update our database
            if (interest_thus_far !== null){
              var update_text = "UPDATE tx_info SET amount=($1), timestamp_requested=($2) WHERE requested_user=($3) AND recv_addr=('INTEREST')";
              self.tell_sql(update_text, [total_interest, what_time_is_now, user_id]);
            } else {
              var insrt_text = 'INSERT INTO tx_info(recv_addr, amount, approved, requested_user, timestamp_requested) values($1, $2, $3, $4, $5)';
              self.tell_sql(insrt_text, ['INTEREST', total_interest, true, user_id, what_time_is_now]);
            }
            callback_fun(total_interest);
            return;
          });
        } else {
          callback_fun(0);
          return;
        }
      });
    });
  }

  this.withdrawl_create = function(user_id, user_lang, user_name, withdraw_addr, avail_bal ){
    var u_id = user_id;
    var u_n = user_name;
    var u_l = user_lang;
    var w_a = withdraw_addr;
    var available_balance = avail_bal;
    var fun_tor = function(sent_msg) {
      var message_id = sent_msg.message_id;

      self.bot.onReplyToMessage(u_id, message_id, function (msg) {

        var msg_text = msg.text;
        var amount_msg = msg_text.split(" ")[0];
        var amount = 0;

        var valid = false;
        if (amount_msg.indexOf('all') !== -1){
          amount = available_balance;
        } else {
          try {
            amount = blocktrail.toSatoshi(parseFloat(amount_msg));
          }
          catch (e) {
            console.log('error parsing withdrawl msg')
          }
        }
        valid = ((amount != 0) && (amount <= available_balance))

        if (valid) {
          // record request into db
          self.create_admin_approval(u_id, u_n, w_a, amount);
          // and alert admin
          var v_msg = self.msg_lookup.get_text(u_l, 'withdrawal_succ_text');
          var v_msg_2 = self.msg_lookup.get_text(u_l, 'withdrawal_succ_text_rest');
          v_msg += self.pretty_print_amount(amount) + v_msg_2;
          var mm_kb = self.main_menu_resp(u_id, u_l); // back to main menu ok
          self.bot.sendMessage(u_id, v_msg, mm_kb);
        } else {
          var v_msg = self.msg_lookup.get_text(u_l, 'withdrawal_err_text');
          var do_it_again = self.withdrawl_create(u_id, u_l, u_n, w_a, available_balance);
          self.bot.sendMessage(u_id, v_msg, {"reply_markup":{'force_reply':true}}).then(do_it_again);
        }
      });
    };
    return fun_tor;
  }

  this.reinvest_create = function(user_id, user_lang, user_name, avail_bal ){
    var u_id = user_id;
    var u_n = user_name;
    var u_l = user_lang;
    var available_balance = avail_bal;
    var fun_tor = function(sent_msg) {
      var message_id = sent_msg.message_id;

      var v_err_msg = self.msg_lookup.get_text(u_l, 'reinvest_err_text');
      var do_it_again = self.reinvest_create(u_id, u_l, u_n, available_balance);

      self.bot.onReplyToMessage(u_id, message_id, function (msg) {

        var msg_text = msg.text;
        var amount_msg = msg_text.split(" ")[0];
        var amount = 0;

        var valid = false;
        if (amount_msg.indexOf('all') !== -1){
          amount = available_balance;
        } else {
          try {
            amount = blocktrail.toSatoshi(parseFloat(amount_msg));
          }
          catch (e) {
            console.log('error parsing reinvest msg')
          }
        }
        valid = ((amount != 0) && (amount <= available_balance))

        if (valid) {
          self.lookup_user_info(u_id, 'deposit_addr', function(recv_addr){
            if (recv_addr){
              // record request into db

              // negative amount
              var now_is = new Date();
              var fake_tx_id = "" + now_is.valueOf();
              var record_amt = -1 * amount;
              var insrt_text = 'INSERT INTO tx_info(recv_addr, amount, approved, requested_user, requested_user_name) values($1, $2, $3, $4, $5)';
              self.tell_sql(insrt_text, ['BONUS', record_amt, true, u_id, u_n]);

              // reinvestment
              var reinsrt_text = 'INSERT INTO tx_info(recv_addr, amount, approved, timestamp_confirmed, requested_user, requested_user_name) values($1, $2, $3, $4, $5, $6)';
              self.tell_sql(reinsrt_text, [recv_addr, amount, true, now_is, u_id, u_n]);

              var v_msg = self.msg_lookup.get_text(u_l, 'reinvest_succ_text');
              var v_msg_2 = self.msg_lookup.get_text(u_l, 'reinvest_succ_text_rest');
              v_msg += self.pretty_print_amount(amount) + v_msg_2;
              var mm_kb = self.main_menu_resp(u_id, u_l); // back to main menu ok
              self.bot.sendMessage(u_id, v_msg, mm_kb);

            } else {
              self.bot.sendMessage(u_id, v_err_msg, {"reply_markup":{'force_reply':true}}).then(do_it_again);
            }
          });
        } else {
          self.bot.sendMessage(u_id, v_err_msg, {"reply_markup":{'force_reply':true}}).then(do_it_again);
        }
      });
    };
    return fun_tor;
  };

  this.get_status = function(callback_fun){
    var qry_text = 'SELECT count(*) FROM user_info';
    self.ask_sql(qry_text, function(user_count){
      var total_user_count = parseInt(user_count.rows[0].count);
      var tor = `@${c.BOT_USERNAME} has ${total_user_count} users, admins are @`
      tor += (self.admin_user_list.join(', @'));
      callback_fun(tor);
    });
  }

  // setup blockchain webhook
  if (webhook_url !== undefined) {
    this.bot.buttcoin_processor = this.handle_tx_event;
    this.bot.alive_check = this.get_status;
    this.bot.setWebHook(`${webhook_url}/bot${c.TELE_TOKEN}`);
    this.bot.openWebHook(c);
  }

}

// run it
var pwnBot = new JesusBot(bot, sql_client);


// Developed by R6Click.com; Richard Nii Lante Lawson