const DEBUG = false
var tickers = { "models": {}, "views": {}, "controllers": {}}
var counter = 0 // DEBUG line TODO remove

window.addEventListener("message", handleAddonMessages, false);

function handleAddonMessages(message) {
  if (message.data.type == "updateTickerConfiguration" && (typeof message.data.data != "undefined") ) {
    updateTickerConfiguration(message.data.data)
  } else if (message.data.type == "updateTickerModelPrice") {
    updateTickerModelPrice(message.data.data)
  }
}

function updateTickerConfiguration(message) {
  var data = message
  var id = data.id

  // Initialize View
  tickers["views"][id] = getTickerView(id)

  // Initialize Data Model
  var tickerModel = getTickerModel(data, updateView)
  tickers["models"][id] = tickerModel

  // Initialize Controllers
  tickers["controllers"][id] = getTickerController(tickerModel)
}

// Models

function getTickerModel(data, observer) {
  var tickerModel = tickers["models"][data.id]
  if (tickerModel) {
    updateTickerModelConfiguration(tickerModel, data)
  } else {
    tickerModel = createAndConfigureTickerModel(data, observer)
  }
  return tickerModel;
}

function createAndConfigureTickerModel(data, observer) {
  var tickerModel = createTickerModel(data.id)
  tickerModel.initialize(observer)
  updateTickerModelConfiguration(tickerModel, data)
  return tickerModel
}

function updateTickerModelConfiguration(tickerModel, data) {
  if (data.enabled) {
    tickerModel.enabled = true
  }
  if (data.color) {
    tickerModel.color = data.color
  }
  if (data.updateInterval) {
    tickerModel.updateInterval = data.updateInterval
  }
}

function createTickerModel(id) {
  var ticker = {
    id: id,
    enabled: false,
    exchangeName: null,
    currency: null,
    baseCurrency: null,
    color: null,
    price: 0,
    updateInterval: 0,
    observers: [],
    // Retrieve tickers provider and configuration data from repository
    initialize: function(observer) {
      ticker.observers.push(observer)
      var data = getProvider(ticker.id)
      if (data) {
        ticker.exchangeName = data.exchangeName
        ticker.currency = data.currency
        ticker.baseCurrency = data.baseCurrency
        ticker.color = data.color
        $('.ticker').text(ticker.id + ' ' + ticker.exchangeName + ' initialized') // DEBUG line TODO remove
      }
    },
    updatePrice: function(newPrice) {
      if (newPrice > 0) {
        ticker.price = newPrice
        for (var i = 0; i < ticker.observers.length; i++) {
          ticker.observers[i](ticker) // Notify observers
        }
      }
    }
  }
  return ticker
}

function updateTickerModelPrice(data) {
  if ((typeof data.id != "undefined") && (typeof data.price != "undefined")) {
    if (tickers["models"][data.id]) {
      tickers["models"][data.id].updatePrice(data.price)
    }
  }
}

function getProvider(id) {
  return tickersRepository[id]
}

function getLatestData(id) {
  var data = getProvider(id)
  if (data) {
    var url = data.url
    var jsonPath = data.jsonPath
    $('.ticker').text(' Getting ' + url + '-' + jsonPath.length) // DEBUG line TODO remove
    window.parent.postMessage({
      "id" : id,
      "url" : url,
      "jsonPath" : jsonPath
    }, "*");
  }
}

// Views

function getTickerView(id) {
  var tickerView = $(".ticker#"+id)
  if (tickerView.size() == 0) {
    tickerView = createTickerView(id)
  }
  return tickerView
}

function createTickerView(id) {
  var tickerView = newViewTicker(id)
  $('#tickers-body').append(tickerView)
  return tickerView
}
function newViewTicker(tickerId) {
  return $( "<div></div>", {
    "id": tickerId,
    "class": "ticker",
    "text": 'New emtpy ticker for ' + tickerId
  })
}

// Controllers

function getTickerController(tickerModel) {
  var tickerController = tickers["controllers"][tickerModel.id]
  if (typeof tickerController == "undefined") {
    tickerController = createTickerController(tickerModel.id, tickerModel.requestPriceUpdate, tickerModel.updateInterval)
  }
  return tickerController
}

function createTickerController(tickerId, requestPriceUpdate, intervalSeconds) {
  var requestPriceUpdate = function() {
    getLatestData(tickerId)
  }
  return {
    id: tickerId,
    priceUpdater: requestPriceUpdate,
    timer: startAutoPriceUpdate(tickerId, requestPriceUpdate, intervalSeconds)
  }
}

function startAutoPriceUpdate(tickerId, requestPriceUpdate, intervalSeconds) {
  if (tickers["controllers"][tickerId] && tickers["controllers"][tickerId][timer]) {
    clearInterval(tickers["controllers"][tickerId][timer]); // Stop automatic refresh of ticker
  }
  var timer = null
  if (intervalSeconds > 0) {
    timer = setInterval(requestPriceUpdate, (intervalSeconds * 1000)) // Start periodic auto update
  }
  return timer
}

function updateView(ticker) {
  var tickerView = $(".ticker#"+ticker.id)
  if (tickerView.size() == 1) {
    tickerView.text(ticker.id + ' ' + ticker.price + ' ' + ++counter) // DEBUG line TODO remove
  }
}




/*
// Update content of ticker widget //
self.port.on("updateContent", function(new_content) { 
  if (new_content != null) {
    $('#ticker-data').text(new_content);
  }
});

// Update and style of ticker widget //
self.port.on("updateStyle", function(color, font_size, background_color) {
  $('#ticker-data').css('font-size', font_size);
  $('#ticker-data').css('color', color);
  if (background_color) {
    $('#ticker-data').removeClass();
    $('#ticker-data').addClass(background_color);
  } else {
    $('#ticker-data').removeClass();
  }
  var body_el = document.getElementById('ticker-body');
  var client_width = body_el.clientWidth;
  var scroll_width = body_el.scrollWidth;
  if (($('#ticker-data').width() > 0) && (client_width != scroll_width)) {
    self.port.emit('increaseWidth', 1);
  }
});
*/