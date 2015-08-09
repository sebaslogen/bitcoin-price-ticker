var tickersRepository = {
  // US Dollar prices //
  'BitStampUSD': { exchangeName:'BitStamp', currency:'$', baseCurrency:'\u0243', url:"https://www.bitstamp.net/api/ticker/", jsonPath:['last']},
  'BTCeUSD': { exchangeName:'BTCe', currency:'$', baseCurrency:'\u0243', url:"https://btc-e.com/api/2/btc_usd/ticker", jsonPath:['ticker','last']},
  'KrakenUSD': { exchangeName:'Kraken', currency:'$', baseCurrency:'\u0243', url:"https://api.kraken.com/0/public/Ticker?pair=XBTUSD", jsonPath:['result','XXBTZUSD','c',0]},
  'CoinDeskUSD': { exchangeName:'CoinDesk', currency:'$', baseCurrency:'\u0243', url:"http://api.coindesk.com/v1/bpi/currentprice.json", jsonPath:['bpi','USD','rate_float']},
  'CoinbaseUSD': { exchangeName:'Coinbase', currency:'$', baseCurrency:'\u0243', url:"https://coinbase.com/api/v1/currencies/exchange_rates", jsonPath:['btc_to_usd']},
  'CampBXUSD': { exchangeName:'CampBX', currency:'$', baseCurrency:'\u0243', url:"http://campbx.com/api/xticker.php", jsonPath:['Last Trade']},
  'BitPayUSD': { exchangeName:'BitPay', currency:'$', baseCurrency:'\u0243', url:"https://bitpay.com/api/rates", jsonPath:[1,'rate']},
  'TheRockTradingUSD': { exchangeName:'TheRockTrading', currency:'$', baseCurrency:'\u0243', url:"https://www.therocktrading.com/api/ticker/BTCUSD", jsonPath:['result',0,'last']},
  'BitFinexUSD': { exchangeName:'BitFinex', currency:'$', baseCurrency:'\u0243', url:"https://api.bitfinex.com/v1/ticker/btcusd", jsonPath:['last_price']},
  // Euro prices //
/*  'BTCeEUR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'KrakenEUR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CoinDeskEUR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitPayEUR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitonicEUR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'Bitcoin-CentralEUR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'TheRockTradingEUR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CoinDeskGBP': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'LocalbitcoinsGBP': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BittyliciousGBP': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitPayGBP': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitcurexPLN': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CaVirTexCAD': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BTCChinaCNY': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'MercadoBitcoinBRL': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BTCTurkTRY': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitcoinVenezuelaVEF': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'LocalbitcoinsVEF': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CoinbaseVEF': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitcoinVenezuelaARS': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'LocalbitcoinsARS': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CoinbaseARS': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitexARS': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'LocalbitcoinsCLP': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitsoMXN': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitXZAR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CoinbaseZAR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'Bit2CILS': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BTCeLitecoin': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'KrakenLitecoin': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'VircurexLitecoin': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BTCeLitecoinUSD': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BTCeLitecoinEUR': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'VircurexWorldcoin': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CryptsyDogecoin': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'KrakenDogecoin': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BTCeNamecoinUSD': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CryptsyAuroracoin': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CryptsyBlackcoin': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CryptsyNxt': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'PoloniexNxt': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'PoloniexBitshares': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'KrakenRipple': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'PoloniexMaidsafe': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'PoloniexBitcoindark': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'PoloniexMonero': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CryptsyDashBTC': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'CryptsyDashUSD': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitFinexDashBTC': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'BitFinexDashUSD': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX},
  'PoloniexBurst': { exchangeName:'XXXXX', currency:'XXXXX', baseCurrency:'XXXXX', url:"XXXXX", jsonPath:XXXXX}*/
};// Store all tickers here
/*
  setupTicker('BTCeEUR', 'BTCe', '\u20ac', '\u0243', '#013ADF', "https://btc-e.com/api/2/btc_eur/ticker", ['ticker','last']);
  setupTicker('KrakenEUR', 'Kraken', '\u20ac', '\u0243', '#3366FF', "https://api.kraken.com/0/public/Ticker?pair=XBTEUR", ['result','XXBTZEUR','c',0]);
  setupTicker('CoinDeskEUR', 'CoinDesk', '\u20ac', '\u0243', '#000066', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','EUR','rate_float']);
  setupTicker('BitPayEUR', 'BitPay', '\u20ac', '\u0243', '#B43104', "https://bitpay.com/api/rates", [2,'rate']);
  setupTicker('BitonicEUR', 'Bitonic', '\u20ac', '\u0243', '#B43104', "https://bitonic.nl/api/price", ['price']);
  setupTicker('Bitcoin-CentralEUR', 'Bitcoin-Central', '\u20ac', '\u0243', '#B43104', "https://bitcoin-central.net/api/v1/data/eur/ticker", ['price']);
  setupTicker('TheRockTradingEUR', 'TheRockTrading', '\u20ac', '\u0243', '#B43104', "https://www.therocktrading.com/api/ticker/BTCEUR", ['result',0,'last']);

  // Pound prices //
  setupTicker('CoinDeskGBP', 'CoinDesk', '\u00a3', '\u0243', '#088A08', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','GBP','rate_float']);
  setupTicker('LocalbitcoinsGBP', 'Localbitcoins', '\u00a3', '\u0243', '#088A08', "https://localbitcoins.com/bitcoinaverage/ticker-all-currencies/", ['GBP','rates','last']);
  setupTicker('BittyliciousGBP', 'Bittylicious', '\u00a3', '\u0243', '#088A08', "https://bittylicious.com/api/v1/quote/BTC/GB/GBP/BANK/1", ['totalPrice']);
  setupTicker('BitPayGBP', 'BitPay', '\u00a3', '\u0243', '#FF0000', "https://bitpay.com/api/rates", [3,'rate']);

  // Polish zloty //
  setupTicker('BitcurexPLN', 'Bitcurex', 'z\u0141', '\u0243', '#B43104', "https://bitcurex.com/api/pln/ticker.json", ['last_tx_price']);
  
  // Canadian dollar prices //
  setupTicker('CaVirTexCAD', 'CaVirTex', 'C$', '\u0243', '#B43104', "https://www.cavirtex.com/api/CAD/ticker.json", ['last']);

  // Yuan prices //
  setupTicker('BTCChinaCNY', 'BTCChina', '\u5143', '\u0243', '#DF01D7', "https://data.btcchina.com/data/ticker", ['ticker','last']);

  // Ruble prices //
  setupTicker('BTCeRUR', 'BTCe', 'RUR', '\u0243', '#4F3107', "https://btc-e.com/api/2/btc_rur/ticker", ['ticker','last']);

  // Brazilian Real prices //
  setupTicker('MercadoBitcoinBRL', 'MercadoBitcoin', 'R$', '\u0243', '#2F4F15', "https://www.mercadobitcoin.com.br/api/ticker/", ['ticker','last']);

  // Turkish Lira //
  setupTicker('BTCTurkTRY', 'BTCTurk', '\u20ba', '\u0243', '#5B5B2F', "https://www.btcturk.com/api/ticker", ['last']);

  // Venezuelan Bolivar //
  setupTicker('BitcoinVenezuelaVEF', 'BitcoinVenezuela', 'Bs', '\u0243', '#672F7F', "http://bitcoinvenezuela.com/api/btcven.json", ['BTC','VEF']);
  setupTicker('LocalbitcoinsVEF', 'Localbitcoins', 'Bs', '\u0243', '#088A08', "https://localbitcoins.com/bitcoinaverage/ticker-all-currencies/", ['VEF','rates','last']);
  setupTicker('CoinbaseVEF', 'Coinbase', 'Bs', '\u0243', '#4C285B', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_vef']);

  // Argentinian Peso //
  setupTicker('BitcoinVenezuelaARS', 'BitcoinVenezuela', 'ARS$', '\u0243', '#783489', "http://bitcoinvenezuela.com/api/btcven.json", ['BTC','ARS']);
  setupTicker('LocalbitcoinsARS', 'Localbitcoins', 'ARS$', '\u0243', '#088A08', "https://localbitcoins.com/bitcoinaverage/ticker-all-currencies/", ['ARS','rates','last']);
  setupTicker('CoinbaseARS', 'Coinbase', 'ARS$', '\u0243', '#582266', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_ars']);
  setupTicker('BitexARS', 'Bitex', 'ARS$', '\u0243', '#783489', "https://bitex.la/api-v1/rest/btc/market/ticker", ['last']);

  // Chilean Peso
  setupTicker('LocalbitcoinsCLP', 'Localbitcoins', '$', '\u0243', '#088A08', "https://localbitcoins.com/bitcoinaverage/ticker-all-currencies/", ['CLP','rates','last']);

  // Mexican Peso
  setupTicker('BitsoMXN', 'Bitso', '$', '\u0243', '#088A08', "https://api.bitso.com/public/info", ['btc_mxn','rate']);

  // South African Rand //
  setupTicker('BitXZAR', 'BitX', 'R', '\u0243', '#4A1F54', "https://bitx.co.za/api/1/BTCZAR/ticker", ['last_trade']);
  setupTicker('CoinbaseZAR', 'Coinbase', 'R', '\u0243', '#4A1F54', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_zar']);

  // Shekel (Israel) //
  setupTicker('Bit2CILS', 'Bit2C', '\u20AA', '\u0243', '#4A1F54', "https://www.bit2c.co.il/Exchanges/BtcNis/Ticker.json", ['ll']);

  // Litecoin prices //
  setupTicker('BTCeLitecoin', 'BTCe', '\u0243', '\u0141', '#013ADF', "https://btc-e.com/api/2/ltc_btc/ticker", ['ticker','last']);
  setupTicker('VircurexLitecoin', 'Vircurex', '\u0243', '\u0141', '#0B0B3B', "https://api.vircurex.com/api/get_last_trade.json?base=LTC&alt=BTC", ['value']);
  setupTicker('KrakenLitecoin', 'Kraken', '\u0141', '\u0243', '#000066', "https://api.kraken.com/0/public/Ticker?pair=XBTLTC", ['result','XXBTXLTC','c',0]);

  // Litecoin USD prices //
  setupTicker('BTCeLitecoinUSD', 'BTCe', '$', '\u0141', '#413ADF', "https://btc-e.com/api/2/ltc_usd/ticker", ['ticker','last']);

  // Litecoin EUR prices //
  setupTicker('BTCeLitecoinEUR', 'BTCe', '\u20ac', '\u0141', '#413ADF', "https://btc-e.com/api/2/ltc_eur/ticker", ['ticker','last']);

  // WorldCoin prices //
  setupTicker('VircurexWorldcoin', 'Vircurex', '\u0243', 'WDC', '#0B0B3B', "https://api.vircurex.com/api/get_last_trade.json?base=WDC&alt=BTC", ['value']);

  // Dogecoin prices //
  setupTicker('CryptsyDogecoin', 'Cryptsy', '\u0243', 'DOGE', '#413ADF', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=132", ['return','markets','DOGE','lasttradeprice']);
  setupTicker('KrakenDogecoin', 'Kraken', 'DOGE', '\u0243', '#000066', "https://api.kraken.com/0/public/Ticker?pair=XBTXDG", ['result','XXBTXXDG','c',0]);

  // Namecoin prices //
  setupTicker('BTCeNamecoinUSD', 'BTCe', '$', 'NMC', '#413ADF', "https://btc-e.com/api/2/nmc_usd/ticker", ['ticker','last']);

  // Auroracoin prices //
  setupTicker('CryptsyAuroracoin', 'Cryptsy', '\u0243', 'AUR', '#413ADF', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=160", ['return','markets','AUR','lasttradeprice']);

  // Blackcoin prices //
  setupTicker('CryptsyBlackcoin', 'Cryptsy', '\u0243', 'BC', '#000', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=179", ['return','markets','BC','lasttradeprice']);

  // Nxt prices //
  setupTicker('CryptsyNxt', 'Cryptsy', '\u0243', 'NXT', '#000', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=159", ['return','markets','NXT','lasttradeprice']);
  setupTicker('PoloniexNxt', 'Poloniex', '\u0243', 'NXT', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_NXT', 'last']);

  // Bitshares prices //
  setupTicker('PoloniexBitshares', 'Poloniex', '\u0243', 'BTS', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_BTS', 'last']);

  // Ripple prices //
  setupTicker('KrakenRipple', 'Kraken', 'XRP', '\u0243', '#000066', "https://api.kraken.com/0/public/Ticker?pair=XBTXRP", ['result','XXBTXXRP','c',0]);

  // Maidsafe prices //
  setupTicker('PoloniexMaidsafe', 'Poloniex', '\u0243', 'MAID', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_MAID', 'last']);

  // BitcoinDark prices //
  setupTicker('PoloniexBitcoindark', 'Poloniex', '\u0243', 'BTCD', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_BTCD', 'last']);

  // Monero prices //
  setupTicker('PoloniexMonero', 'Poloniex', '\u0243', 'XMR', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_XMR', 'last']);

  // Dash prices //
  setupTicker('CryptsyDashBTC', 'Cryptsy', '\u0243', 'DASH', '#000', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=155", ['return','markets','DRK','lasttradeprice']);
  setupTicker('BitFinexDashBTC', 'BitFinex', '\u0243', 'DASH', '#000', "https://api.bitfinex.com/v1/ticker/drkbtc", ['last_price']);
  setupTicker('CryptsyDashUSD', 'Cryptsy', '$', 'DASH', '#000', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=213", ['return','markets','DRK','lasttradeprice']);
  setupTicker('BitFinexDashUSD', 'BitFinex', '$', 'DASH', '#000', "https://api.bitfinex.com/v1/ticker/drkusd", ['last_price']);

  // Burst prices //
  setupTicker('PoloniexBurst', 'Poloniex', '\u0243', 'BURST', '#fff', "https://poloniex.com/public?command=returnTicker", ['BTC_BURST', 'last']);*/