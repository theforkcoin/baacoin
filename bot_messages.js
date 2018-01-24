var c = require('./config');

// EDIT THESE TEXTS (ONLY THE LINES THAT ARE NOT INDENTED)
// TRY NOT TO GET RID OF 's or ,s 
// DO NOT CHANGE THE EMOJIS FOR MENU OPTIONS UNLESS
// YOU EDIT THE CODE IN index.js AS WELL
// REMEMBER TO PROPERLY ESCAPE SPECIAL CHARACTERS

(function () {
    var text_provider = function(){
        var self = this;

this.initial_welcome_msg = `🔑 Welcome to ${c.BOTNAME} \n
${c.BOTNAME} generates per-user investment, 6% per day on each deposit, with the benefit of stackable deposits increasing hourly. Bigger, Better, Stronger and Safer.`;

this.big_dict = {
'english': {
'language_select_complete': 'Your language is now set to English; you can change this any time in the Options menu',
'welcome_msg': 'Welcome Back',
'error_msg': 'Whoops, something went wrong! Our developers have been alerted.',

'main_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '💵 Deposit'}, {text: '🏧 Withdraw'}], 
[{text: '📊 Statistics'}, {text: '♻️ Reinvest'}],
[{text: '🚸 My Referral Link'}, {text: '⚙️ Options'}],
[{text: '🌐 FAQ'},{text: '📝 Support'}]
]
})
},

'main_menu_admin': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '💵 Deposit'}, {text: '🏧 Withdraw'}], 
[{text: '📊 Statistics'}, {text: '♻️ Reinvest'}],
[{text: '🚸 My Referral Link'}, {text: '⚙️ Options'}],
[{text: '🌐 FAQ'},{text: '📝 Support'}],
[{text: '🍀 Admin Menu'}]
]
})
},

'admin_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '⚖️ Check Wallet Balance'}], 
[{text: '⏰ Check Pending Deposits'}],
[{text: '💳 Pending Withdrawal Approvals'}],
[{text: '🏆 Give Bonus'}],
[{text: '🏠 Return to Main Menu'}]
]
})
},

'options_text': 'Options:',
'options_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '🖍 Edit Withdraw Address'}],
[{text: '🇪🇺 Edit Language'}], 
[{text: '🏠 Return to Main Menu'}]
],
})
},
'return_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '🏠 Return to Main Menu'}]
]
})
},

'deposit_text': 'Your deposit address is',
'deposit_initial_text': 'Minimum deposit is 0.001 btc. Please send your coins to the following address',
'deposit_text_rest': 'Your investment plan will be started after 3 network confirmations.',
'deposit_confirmed_text': 'We received your deposit of',
'deposit_confirmed_text_rest': ' btc, you will start earning interest after 24 hours.',

'bonus_text': 'You\'ve earned a bonus of ',
'bonus_text_rest': ' btc\nbe sure to thank @',

'withdrawal_addr_text': 'Reply to this message with your btc address to set your withdrawal address',
'withdrawal_addr_error_text': 'Sorry, that\'s not a valid btc address\n Try again, or click /back to cancel',
'withdrawal_addr_success_text': 'Thanks, your withdrawal address has been set successfully',

'withdrawal_error_text': 'Your current balance is not enough to withdraw. The minimum needed is 0.004 btc\nYou have: ',
'withdrawal_error_addr_text': 'You need to set an address before you can withdraw',

'withdrawal_text': 'Your current balance available to withdraw is ',
'withdrawal_text_addr_check': 'If the above address is correct',
'withdrawal_text_rest': '\nReply to this message with the amount you wish to withdraw or type "all"\n or click /back to cancel',

'withdrawal_err_text': 'You don\'t have enough funds! Try again, or go /back',
'withdrawal_succ_text': 'Your request to withdraw ',
'withdrawal_succ_text_rest': ' btc is processing',

'withdrawal_approved_text': '💰 Your withdrawal request for ',
'withdrawal_approved_text_rest': ' btc was successful 💰\n',

'reinvest_text': 'Your current balance available to reinvest is ',
'reinvest_text_rest': 'btc\nReply to this message with the amount you wish to reinvest or type "all"\n or click /back to cancel',
'reinvest_error_text': 'Your current balance is not enough to reinvest. The minimum needed is 0.002 btc\nYou have: ',
'reinvest_succ_text': 'Your request to reinvest ',
'reinvest_succ_text_rest': 'btc was successful',
'reinvest_err_text': 'You don\'t have enough funds! Try again, or go /back',

'referral_msg_text': `Your friend has invited you to join ${c.BOTNAME}, click the link below to get started\n`,

'stats_text_1': 'Account Balance: ',
'stats_text_2': ' btc\nTotal Invested:  ',
'stats_text_3': ' btc\nTotal Profit:    ',
'stats_text_4': ' btc',

'referral_stats_text_1': 'Your total referrals: ',
'referral_stats_text_2': '\nActive referrals: ',

'faq_text': `Frequently Asked Questions:

1. What is ${c.BOTNAME}?

${c.BOTNAME} depends on the amount of stackable Crypto Coins that arise from each fork, thereby drastically lowering the fees and reducing the number of blocks required many times over. This creates massive profits.

2. How does ${c.BOTNAME} work?

ForkCoin generates from every increase in stackable blocks a further percentage gain of 6%, which is distributed to each investor. 

3. Can I deposit more than once?

With every investment starting at 0.001 BTC, our system automatically creates a 30 day plan to be reproduced through this daily 6% profit. Another investment or reinvest creates another 30 day plan with 6% daily profit.

4. How can I withdraw my profit?

A payout is possible from 0.004 BTC and is done automatically by our system. Due to network and transaction acknowledgments, a payout can take several hours, usually only a few minutes.

5. How can I earn more money?

ForkCoin has an excellent bonus 2-level Affiliate System. To reach other active users you get 10% of the investment amount of the new user in the first level and 5% in the second level. With the uniquely generated referral link, more active users can join in, which will then appear as active in your downline.

6. How can I participate in bonuses?

If you have an active investment of 0.5 btc or more you will automatically be enrolled in our raffle. Winners are chosen every 3 days and will get up to a 0.5 btc bonus.

7. What if I experience problems?

For questions or problems please click on the support button or contact an admin directly in the community group. Most problems within the group are clarified by other users. We are always ready for you.

https://t.me/ForkCChatENG - https://t.me/ForkCChatDE - https://t.me/ForkCoinNews
Admin & CEO ForkCoinBot - @Fork_Coin_CEO

Be always up to date! Our Telegram news and info channel is here:
📢ForkCoinNewsChannel
https://t.me/ForkCoinNews

If you have a problem, kindly join our group chat:
🇩🇪deutsche Community
https://t.me/ForkCChatDE
🇺🇸englische Community
https://t.me/ForkCChatENG

Or contact one of the support below:
📝Support / Admin
@Fork_Coin_CEO

Or email us at:
henrybueno@gmx.net`,
'referral_text': `Earn a Referral Bonus for every user that you recruit! Here's how it works:

As our thanks to you, you will earn 10% of their initial deposit
Plus, any user that they refer, will earn you 5% of their initial deposit
And any user referred by a user you refer, will earn you 1% of their initial deposit

All you have to do is forward the following message with your unique referral link`,
'referral_prelauncher_text': `Earn a Referral Bonus for every user that you recruit! Here's how it works:

As our thanks to you, you will earn 10% of their initial deposit
Plus, any user that they refer, will earn you 5% of their initial deposit
And any user referred by a user you refer, will earn you 1% of their initial deposit

All you have to do is forward the following message with your unique referral link`,


},
'french': {

'language_select_complete': 'Votre langue est maintenant configurée en Français, vous pouvez la modifier n\'importe quand dans le menu Options',
'welcome_msg': 'Nous saluons le retour',
'error_msg': 'Whoops, quelque chose ne s\'est pas déroulé, nos développeurs ont été alerté et répareront ce qui se passera!',

'main_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '💵 Dépôt'}, {text: '🏧 Retirer'}], 
[{text: '📊 Statistiques'}, {text: '♻️ Reinvest'}],
[{text: '🚸 Mon lien de référence'}, {text: '⚙️ Les options'}],
[{text: '🌐 FAQ'},{text: '📝 soutien'}] 
]
})},

'options_text': 'Options:',
'options_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '🖍 Modifier retirer l\'adresse'}],
[{text: '🇪🇺 Modifier la langue'}], 
[{text: '🏠 Retour au menu principal'}]
],
})
},
'return_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '🏠 Retour au menu principal'}]
]
})
},

'deposit_text': 'Votre adresse de dépôt est',
'deposit_initial_text': 'Le dépôt minimum est de 0.001 btc, veuillez envoyer vos pièces à l\'adresse suivante',
'deposit_confirmed_text': 'Nous avons reçu votre dépôt de ',
'deposit_confirmed_text_rest': ' btc, vous commencerez à vous intéresser après 24 heures.',

'bonus_text': 'Vous avez gagné un bonus de',
'bonus_text_rest': ' btc\nAssurez-vous de remercier @',

'withdrawal_addr_text': 'Répondez à ce message avec votre adresse btc pour définir votre adresse de retrait',
'withdrawal_addr_error_text': 'Désolé, ce n\'est pas une adresse btc valide\nRéessayez ou cliquez sur /back',
'withdrawal_addr_success_text': 'Merci, votre adresse de retrait a été réglée avec succès',

'withdrawal_error_text': 'Votre solde actuel n\'est pas suffisant pour vous retirer. Le minimum requis est de 0.004 btc\nTu as: ',
'withdrawal_error_addr_text': 'Vous devez définir une adresse avant de pouvoir retirer',

'withdrawal_text': 'Votre solde actuel disponible pour le retrait est ',
'withdrawal_text_addr_check': 'Si l\'adresse ci-dessus est correcte',
'withdrawal_text_rest': '\nRépondez à ce message avec le montant que vous souhaitez retirer ou taper "tout"\n ou cliquez sur /back',

'withdrawal_succ_text': 'Votre demande de retrait ',
'withdrawal_succ_text_rest': 'btc est traitement',

'withdrawal_approved_text': '💰 Votre demande de retrait pour',
'withdrawal_approved_text_rest': ' btc était un succès 💰',

'withdrawal_err_text': 'Vous n\'avez pas assez de fonds! Réessayer, ou aller /back',

'referral_msg_text': `Votre ami vous a invité à rejoindre ${c.BOTNAME}, cliquez sur le lien ci-dessous pour commencer\n`,

'stats_text_1':       'Solde du compte: ',
'stats_text_2': ' btc\nTotal Investissement:  ',
'stats_text_3': ' btc\nTotal Bénéfice:    ',
'stats_text_4': ' btc',

'referral_stats_text_1': 'Vos références totales: ',
'referral_stats_text_2': '\nRenvois actifs: ',

'faq_text': `Questions fréquemment posées:

1. Quel est ${c.BOTNAME}?

ForkCoin dépend de la quantité de pièces de monnaie Crypto empilables causés par chaque fourche et ainsi réduire drastiquement les charges et à plusieurs reprises de réduire le nombre de blocs nécessaires. Il en résulte des bénéfices énormes.

2.Comment travaille ${c.BOTNAME}?

ForkCoin générée à partir de chacun de la croissance des blocs empilables en outre un gain en pourcentage de 6% d'entre eux sera distribué à chaque épargnant.

3. Puis-je déposer plus d'une fois?

Chaque Invest de 0.001 BTC notre système reproduit automatiquement un plan de 30 jours par ce 6% de profit par jour. Une autre Invest Réinvestir ou crée un nouveau plan de 30 jours avec 6% de gain par jour.

4. Comment puis-je retirer mon bénéfice?

Un paiement est possible de 0.004 BTC et se fait automatiquement par notre système. En raison du réseau et confirmations transaction un paiement peut durer plusieurs heures, habituellement en quelques minutes.

5. Comment puis-je gagner plus d'argent?

ForkCoin a un excellent système d'affiliation de bonus avec deux niveaux. Pour les autres utilisateurs actifs atteignent obtenus dans le premier niveau de 10% du montant de l'investissement du nouvel utilisateur et le second 5%. Avec le lien de référence unique généré peut ainsi apparaître comme rejoindre activement les utilisateurs plus actifs ce widerum puis dans vos filleuls.

6. Comment puis-je participer aux bonus?

Si vous avez un investissement actif de 0.5 btc ou plus, vous serez automatiquement inscrit au tirage au sort. Les gagnants sont choisis tous les 3 jours et recevront un bonus de 0.5 btc.

7. Et si j'éprouve des problèmes?

Pour des questions ou des problèmes, s'il vous plaît cliquer sur le bouton d'assistance ou détournez directement dans le groupe communautaire à un administrateur. La plupart des problèmes sont résolus au sein du groupe d'autres utilisateurs. Nous sommes toujours disponibles pour vous.

https://t.me/ForkCChatENG - https://t.me/ForkCChatDE - https://t.me/ForkCoinNews
Admin & CEO ForkCoinBot - @Fork_Coin_CEO

Soyez toujours à jour! Ma chaîne d'actualités et d'information Telegram est ici:
📢ForkCoinNewsChannel
https://t.me/ForkCoinNews

si vous avez un problème, veuillez joindre notre groupe chat:
🇩🇪deutsche Community
https://t.me/ForkCChatDE
🇺🇸englische Community
https://t.me/ForkCChatENG

Ou Contactez l'un des supports ci-dessous:
📝Support / Admin
@Fork_Coin_CEO

Ou Envoyez-nous un courriel à:
henrybueno@gmx.net`,
'referral_text': `Gagnez un bonus de recommandation pour chaque utilisateur que vous recrutez! Voici comment cela fonctionne:

Comme nous vous remercions, vous gagnerez 10% de leur dépôt initial
De plus, tous les utilisateurs qu'ils renvoient, vous gagnera 5% de leur dépôt initial
Et tout utilisateur référé par un utilisateur que vous renvoyez, vous gagnera 1% de son dépôt initial

Tout ce que vous devez faire est de transmettre le message suivant avec votre lien de référence unique`,
'referral_prelauncher_text': `Gagnez un bonus de recommandation pour chaque utilisateur que vous recrutez! Voici comment cela fonctionne:

Comme nous vous remercions, vous gagnerez 10% de leur dépôt initial
De plus, tous les utilisateurs qu'ils renvoient, vous gagnera 5% de leur dépôt initial
Et tout utilisateur référé par un utilisateur que vous renvoyez, vous gagnera 1% de son dépôt initial

Tout ce que vous devez faire est de transmettre le message suivant avec votre lien de référence unique`,

},
'german': { 'language_select_complete': 'Ihre Sprache ist jetzt auf Deutsch eingestellt; das können Sie im Optionsmenü ändern',
'welcome_msg': 'Willkommen zurück',
'error_msg': 'Ein Problem! Unsere Programmierer wurden benachrichtigt.',

'main_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '💵 Einzahlen'}, {text: '🏧 Abheben'}], 
[{text: '📊 Statistiken'}, {text: '♻️ Reinvest'}],
[{text: '🚸 Meine Verweis Link'}, {text: '⚙️ Optionen'}],
[{text: '🌐 FAQ'},{text: '📝 Support'}]
]
})
},

'main_menu_admin': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '💵 Einzahlen'}, {text: '🏧 Abheben'}], 
[{text: '📊 Statistiken'}, {text: '♻️ Reinvest'}],
[{text: '🚸 Meine Verweis Link'}, {text: '⚙️ Optionen'}],
[{text: '🌐 FAQ'},{text: '📝 Support'}],
[{text: '🍀 Admin Menü'}]
]
})
},

'admin_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '🍞 Kontostand Abfrage'}], 
[{text: '🍇 Unerledigte Zahlungen'}],
[{text: '🍉 Anhängige Rücknahmegenehmigungen'}],
[{text: '🏠 Zurück zum HauptMenü'}]
]
})
},

'options_text': 'Optionen:',
'options_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '🖍 Abhebungsadresse Ändern'}],
[{text: '🇪🇺 Sprache Ändern'}], 
[{text: '🏠 Zurück zum Hauptmenü'}]
],
})
},
'return_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '🏠 Zurück zum Hauptmenü'}]
]
})
},

'deposit_text': 'Ihre Einzahlungsadresse lautet',
'deposit_initial_text': 'Mindesteinzahlung beträgt 0,001 BTC; bitte senden Sie Ihre Münzen an die folgende Adresse',
'deposit_confirmed_text': 'Wir haben deine Anzahlung erhalten von ',
'deposit_confirmed_text_rest': ' btc, Sie erhalten nach 24 Stunden ihre tägliche Gutschrift',

'bonus_text': 'Sie haben einen Bonus verdient von ',
'bonus_text_rest': ' btc\n herzlichen Dank @',

'withdrawal_addr_text': 'address',
'withdrawal_addr_error_text': 'Entschuldigung, das ist keine gültige Adresse\n Versuchen sie es erneut oder klicken sie /back um abzubrechen',
'withdrawal_addr_success_text': 'Danke, deine Abhebungsadresse wurde erfolgreich gespeichert',

'withdrawal_error_text': 'Ihr aktuelles Guthaben reicht nicht aus für eine Auszahlung. Das erforderliche Minimum ist 0,004 btc.\nSie haben: ',
'withdrawal_error_addr_text': 'Sie müssen eine Abhebungsadresse setzen bevor sie sich auszahlen lassen',

'withdrawal_text': 'Ihre aktueller Restbetrag zum Auszahlen ist ',
'withdrawal_text_addr_check': 'Wenn die obige Abhebungsadresse korrekt ist ',
'withdrawal_text_rest': '\nBeantworten Sie diese Nachricht mit dem Betrag den Sie zurückziehen möchten, oder geben Sie "alle" ein\n oder klicken Sie auf /back um abzubrechen',

'withdrawal_succ_text': 'Ihre Auszahlung wurde an den Admin zur Genehmigung geschickt.  Danke!',
'withdrawal_err_text': 'Sie haben nicht genügend Geld! Versuchen Sie es noch einmal, oder gehen Sie zurück',

'withdrawal_approved_text': '💰 Ihre Auszahlungsanfrage für ',
'withdrawal_approved_text_rest': ' btc war erfolgreich 💰\n',

'referral_msg_text': `Dein Freund hat dich eingeladen, sich ${c.BOTNAME} anzuschließen. Bitte klicken Sie auf den Link unten um loszulegen.\n `,

'stats_text_1': 'Kontostand: ',
'stats_text_2': ' btc\nInsgesamt investiert:  ',
'stats_text_3': ' btc\nGesamtgewinn:    ',
'stats_text_4': ' btc',

'referral_stats_text_1': 'Ihre Gesamtverweise: ',
'referral_stats_text_2': '\nAktive Verweise: ',

'faq_text': `Häufig gestellte Fragen:

1. Was ist ${c.BOTNAME}?

ForkCoin richtet sich nach der Menge an stapelbaren Crypto Coins die durch jeden Fork entstehen und dadurch die Gebühren drastisch senken und die Anzahl der benötigten Blöcke um ein vielfaches reduzieren. Dadurch entstehen massive Gewinne.

2. Wie funktioniert ${c.BOTNAME}?

ForkCoin erzeugt aus jedem zuwachs der stapelbaren Blöcke einen weiteren prozentualen Gewinn von 6% dieser an jedem Investor ausgeschüttet wird.

3. Darf ich mehr als einmal ablegen?

Mit jedem Invest ab 0.001 BTC erstellt unser System automatisch einen 30 Tage Plan durch diesen täglich 6% Gewinn reproduziert werden. Ein weiteres Invest oder ein Reinvest erstellt einen weiteren 30 Tage Plan mit jeweils 6% täglichen Gewinn.

4. Wie kann ich meinen Gewinn zurückziehen?
 
Eine Auszahlung ist ab 0.004 BTC möglich und wird von unserem System automatisch erledigt. Auf Grund der Netzwerk und Transaktions Bestätigungen kann eine Auszahlung mehrere Stunden andauern , im Regelfall nur wenige Minuten.

5. Wie kann ich mehr Geld verdienen? 

ForkCoin besitzt ein ausgezeichnetes Bonus Affiliate System mit 2 Level. Für das erreichen weiterer aktiver User erhält man im ersten Level 10% vom Investitionsbetrag des neuen Users und im zweiten 5%. Mit dem einzigartig erzeugten Referral Link können dadurch weitere aktive User beitreten diese widerrum dann in deiner Downline als aktiv erscheinen.

6. Wie kann ich an Boni teilnehmen?
 
Wenn Sie eine aktive Investition von 0,5 btc oder mehr haben, werden Sie automatisch in unsere Verlosung eingeschrieben. Die Gewinner werden alle 3 Tage ausgewählt und werden bis zu einem 0,5-btc-Bonus berechtigt.

7. Was tue ich wenn ich Probleme habe?

Für Fragen oder Probleme klick bitte den Support Button oder wende dich direkt in der Community Gruppe an einen Admin. Die meisten Probleme werden innerhalb der Gruppe von anderen User geklärt. Wir stehen jederzeit für euch bereit.

https://t.me/ForkCChatENG - https://t.me/ForkCChatDE - https://t.me/ForkCoinNews
Admin & CEO ForkCoinBot - @Fork_Coin_CEO

ForkCoin hält Sie immer auf dem Laufenden! ForkCoin News und weitere Infos im Channel :
📢ForkCoinNewsChannel
https://t.me/ForkCoinNews

Wenn Sie ein Problem haben, melden Sie sich bitte unserem Gruppenchat an:
🇩🇪deutsche Community
https://t.me/ForkCChatDE
🇺🇸englische Community
https://t.me/ForkCChatENG

Oder kontaktieren Sie uns unter:
📝Support / Admin
@Fork_Coin_CEO

Oder emailen sie uns unter:
henrybueno@gmx.net`,
'referral_text': `Verdienen Sie einen Empfehlungsbonus für jeden Benutzer, den Sie rekrutieren! So funktioniert das:

Als unser Dank an Sie, verdienen Sie 10% ihrer ursprünglichen Ablagerung
Plus, jeder Benutzer, den sie verweisen, verdienen Sie 5% ihrer ursprünglichen Einzahlung
Und jeder Benutzer der von einem Benutzer, den Sie verweisen, verwiesen wird, erhält Ihnen 1% ihrer ursprünglichen Einzahlung

Alles, was Sie tun müssen, ist die folgende Nachricht mit Ihrem einzigartigen Verweis Link ersetzen und benutzen`,
'referral_prelauncher_text': `Verdienen Sie einen Empfehlungsbonus für jeden Benutzer, den Sie rekrutieren! So funktioniert das:

Als unser Dank an Sie, verdienen Sie 10% ihrer ursprünglichen Ablagerung
Plus, jeder Benutzer, den sie verweisen, verdienen Sie 5% ihrer ursprünglichen Einzahlung
Und jeder Benutzer der von einem Benutzer, den Sie verweisen, verwiesen wird, erhält Ihnen 1% ihrer ursprünglichen Einzahlung

Alles, was Sie tun müssen, ist die folgende Nachricht mit Ihrem einzigartigen Verweis Link ersetzen und benutzen`,

},
'russian': {

'language_select_complete': 'Ваш язык установлен на Русский, вы можете изменить его в любое время в меню «Параметры»',
'welcome_msg': 'Добро Пожаловать',

'main_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '💵 Депонировать'}, {text: '🏧 Изымать'}], 
[{text: '📊 Статистика'}, {text: '♻️ Reinvest'}],
[{text: '🚸 Моя Реферальная Ссылка'}, {text: '⚙️ Параметры'}],
[{text: '🌐 FAQ'},{text: '📝 Помощь'}]
]
})
},


'options_text': 'Параметры:',
'options_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '🖍 Изменить Адрес Вывода'}],
[{text: '🇪🇺 Изменить Язык'}], 
[{text: '🏠 Вернуться в Главное Меню'}]
],
})
},
'return_menu': {
reply_markup: JSON.stringify({
keyboard: [
[{text: '🏠 Вернуться в Главное Меню'}]
]
})
},

'deposit_text': 'Ваш депозитный адрес',
'deposit_initial_text': 'Минимальный депозит 0,001 btc, пожалуйста отправьте ваши монеты по следующему адресу',
'deposit_confirmed_text': 'Мы получили ваш депозит в размере ',
'deposit_confirmed_text_rest': ' btc, вы начнете зарабатывать проценты через 24 часа.',

'bonus_text': 'Вы получили бонус ',
'bonus_text_rest': ' btc\nне забудьте поблагодарить @',

'withdrawal_addr_text': 'Ответьте на это сообщение с вашим адресом, чтобы установить адрес выхода',
'withdrawal_addr_error_text': 'Извините, это не действительный адрес\n Попробуйте еще раз или нажмите /back  чтобы отменить',
'withdrawal_addr_success_text': 'Спасибо, ваш адрес отзыва успешно установлен',

'withdrawal_error_text': 'Ваш текущий баланс слишком мал, чтобы извлекать. Необходимый минимум 0,004 btc \n Вы имеете: ',
'withdrawal_error_addr_text': 'Вам нужно установить адрес, прежде чем вы сможете извлекать',

'withdrawal_text': 'Ваш текущий баланс, доступный для снятия средств ',
'withdrawal_text_addr_check': 'Если вышеуказанный адрес верен',
'withdrawal_text_rest': '\nОтветьте на это сообщение с суммой, которую вы хотите снять или введите "all"\n  или нажмите /back  чтобы отменить',

'withdrawal_err_text': 'У тебя недостаточно средств! Повторите попытку или /back',
'withdrawal_succ_text': 'Ваш запрос отозвать ',
'withdrawal_succ_text_rest': ' btc идет полным ходом',

'withdrawal_approved_text': '💰 Ваш запрос на вывод средств на ',
'withdrawal_approved_text_rest': ' btc был успешным 💰\n',

'referral_msg_text': `Ваш друг пригласил вас присоединиться к боту ${c.BOTNAME}, для того чтобы начать, нажмите на ссылку ниже\n`,

'stats_text_1':       'Баланс:   ',
'stats_text_2': ' btc\nВложение: ',
'stats_text_3': ' btc\nДоход:    ',
'stats_text_4': ' btc',

'referral_stats_text_1': 'Количество рефералов: ',
'referral_stats_text_2': '\nКоличество активных рефералов: ',

'faq_text': `Часто Задаваемые Вопросы:

1. Что такое ${c.BOTNAME}?

ForkCoin зависит от количества наращиваемых Crypto монет, вызванных каждой вилкой и тем самым резко сократить расходы и много раз уменьшить количество требуемых блоков. Это создает огромные прибыли.

2. Как работает ${c.BOTNAME}?

ForkCoin генерирует от каждого увеличения штабелируемых блоков дополнительный процентный прирост 6%, который распределяется между каждым инвестором.

3. Могу ли я внести депозит больше одного раза?

С каждой инвестицией, начинающейся с 0.001 BTC, наша система автоматически создает 30-дневный план, который будет воспроизводиться через эту ежедневную 6-процентную прибыль. Еще одна инвестиция или реинвестирование создает еще один 30-дневный план с 6% дневной прибылью. 

4. Как я могу достать свою прибыль?

Выплата возможна с 0,004 BTC и производится автоматически нашей системой. Из-за подтверждения транзакций и транзакций выплата может занять несколько часов, обычно всего несколько минут.

5. Как я могу заработать больше денег?

ForkCoin имеет отличную бонусную двухуровневую партнерскую систему. Чтобы привлечь других активных пользователей, вы получаете 10% от суммы инвестиций нового пользователя на первом уровне и 5% на втором уровне. С уникально созданной реферальной ссылкой к ней могут присоединиться более активные пользователи, которые затем будут отображаться как активные в вашем нижестоящем лимите.

6. Как я могу участвовать в бонусах?

Если у вас есть активные инвестиции в размере 0,5 btc и более, вы автоматически будете зачислены в нашу лотерею. Победители выбираются каждые 3 дня и получат бонус в 0,5 btc.

7. Что делать, если у меня есть проблемы?

Для вопросов или проблем нажмите кнопку поддержки или свяжитесь с администратором непосредственно в группе сообщества. Большинство проблем в группе уточняются другими пользователями. Мы всегда готовы к вам.

https://t.me/ForkCChatENG - https://t.me/ForkCChatDE - https://t.me/ForkCoinNews
Admin & CEO ForkCoinBot - @Fork_Coin_CEO

Будьте всегда в курсе! Мой новостной и информационный канал находится здесь:
📢ForkCoinNewsChannel
http://t.me/ForkCoinNews

Если у вас есть проблемы, присоединяйтесь к нашему групповому чату:
🇩🇪deutsche Community
http://t.me/ForkCChatDE
🇺🇸englische Community
http://t.me/ForkCChatENG

Или обратитесь к одной из нижеуказанных:
📝Support / Admin
@Fork_Coin_CEO

Или напишите нам по электронной почте:
henrybueno@gmx.net`,
'referral_text': `Зарабатывайте реферальный бонус для каждого пользователя, которого вы набираете! вот как это работает:

Поскольку мы благодарим вас, вы заработаете 10% от первоначального депозита
Кроме того, любой пользователь, которого они называют, заработает вам 5% от первоначального депозита
И любой пользователь, на который ссылается пользователь, которого вы называете, заработает вам 1% от первоначального депозита

Все, что вам нужно сделать, это отправить следующее сообщение с вашей уникальной реферальной ссылкой`,
'referral_prelauncher_text': `Зарабатывайте реферальный бонус для каждого пользователя, которого вы набираете! вот как это работает:

Поскольку мы благодарим вас, вы заработаете 10% от первоначального депозита
Кроме того, любой пользователь, которого они называют, заработает вам 5% от первоначального депозита
И любой пользователь, на который ссылается пользователь, которого вы называете, заработает вам 1% от первоначального депозита

Все, что вам нужно сделать, это отправить следующее сообщение с вашей уникальной реферальной ссылкой`,

}
};

        this.get_text = function(lang, key) {
            if (!(lang in self.big_dict)){
                lang = 'english';
            } else if (!(key in self.big_dict[lang])){
                lang = 'english';
            }
            if (key in self.big_dict[lang]){
                return self.big_dict[lang][key];
            } else {
                if (key.indexOf('menu') >= 0){
                    return self.big_dict[lang]['main_menu']
                } else {
                    return 'oops';
                }
            }
        }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {msg_dict : text_provider};
    }
}());
