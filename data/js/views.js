// Views

function getTickerView(tickerId) {
  var tickerView = $(".ticker#"+tickerId)
  if (tickerView.size() == 0) {
    tickerView = createTickerView(tickerId)
  }
  return tickerView
}

function createTickerView(tickerId) {
  var tickerView = newViewTicker(tickerId)
  $('#tickers-body').append(tickerView)
  return tickerView
}

function newViewTicker(tickerId) {
  return $( "<div></div>", {
    "id": tickerId,
    "class": DEFAULT_TICKER_CSS_CLASSES,
    "text": '---'
  })
}

// Update and style of ticker div //
function updateStyle(tickerId, color, fontSize, background) {
  $(".ticker#"+tickerId).css('font-size', fontSize)
  $(".ticker#"+tickerId).css('color', color)
  if (background) {
    if (background.match(/-bg$/) == null) {
      background += "-bg" // Append background CSS to name when missing
    }
    $(".ticker#"+tickerId).removeClass().addClass(DEFAULT_TICKER_CSS_CLASSES)
    $(".ticker#"+tickerId).addClass(background)
  } else {
    $(".ticker#"+tickerId).removeClass().addClass(DEFAULT_TICKER_CSS_CLASSES)
  }
}

function updateView(tickerId, price, exchangeName, currency, baseCurrency, currencyPosition, color, fontSize, background) {
  var tickerView = $(".ticker#"+tickerId)
  if (tickerView.size() != 1) {
    return // Ticker was removed
  }
  updateStyle(tickerId, color, fontSize, background)
  var roundedPrice = calculateRoundedPrice(price)
  var tickerText = roundedPrice
  switch (currencyPosition) {
    case 'B':
      tickerText = currency + roundedPrice
      break
    case 'A':
      tickerText =  roundedPrice + currency
      break
  }
  tickerView.text(tickerText)
  var label = exchangeName + " " + currency + "/" + baseCurrency
  tickerView.attr("tooltiptext", label)
  tickerView.attr("title", label)
}

function calculateRoundedPrice(price) { // Allow more decimals for low price values
  var round = calculateRoundFactor(price)
  var roundedPrice = Math.round(price * round.factor) / round.factor
  roundedPrice = (round.size > 1) && (roundedPrice > 0) ? roundedPrice.toFixed(round.size) : roundedPrice
  return roundedPrice
}

function calculateRoundFactor(price) { // Allow more decimals for low price values
  var roundFactor = 1
  var sizeRoundFactor = 0
  if (price == 0) {
    return roundFactor
  }
  while (roundFactor * price <= 100) {
    roundFactor *= 10
    if ((roundFactor * price) % 10 != 0) { // Amount of decimals without zeros to the right
      sizeRoundFactor++
    }
  }
  return {factor: roundFactor, size: sizeRoundFactor}
}

/*
var trends = calculateSlopeAndTrend(ticker.last, price, ticker.trend);
ticker.trend = trends.trend;
label_trend = trends.label_trend;
label_slope = trends.label_slope;
            
            var round = calculateRoundFactor(price);
var change = Math.round(1000000*ticker.trend[1]/ticker.trend[0])/100;
var last_ticker_price = Math.round(ticker.last * round.factor) / round.factor;
last_ticker_price = (round.size > 1) && (last_ticker_price > 0) ? last_ticker_price.toFixed(round.size) : last_ticker_price;
ticker.tooltip = ticker.label + " -- previous: "
    + labelWithCurrency(last_ticker_price, currency)
    + " -- trend: " + ((change>0) ? "+" : "") + change;
ticker.last = price;
            price = Math.round(price * round.factor) / round.factor;
            price = (round.size > 1) && (price > 0) ? price.toFixed(round.size) : price;

latest_content = labelWithCurrency(price, currency);
if (getBooleanPreference("show-short-trend")) {
  latest_content = label_slope + latest_content;
}
if (getBooleanPreference("show-long-trend")) {
  latest_content = label_trend + latest_content;
}
*/