const DEBUG = true
const DEFAULT_TICKER_CSS_CLASSES = "ticker"
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

function createTickerModel(id) {
  var ticker = {
    id: id,
    enabled: false,
    exchangeName: null,
    currency: null,
    baseCurrency: null,
    color: null,
    fontSize: null,
    backgroundColor: null,
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
        if (DEBUG) $(".ticker#"+ticker.id).text(ticker.id + ' ' + ticker.exchangeName + ' initialized')
      }
    },
    updatePrice: function(newPrice) {
      if (newPrice > 0) {
        ticker.price = newPrice
        ticker.notifyObservers()
      }
    },
    notifyObservers: function() {
      for (var i = 0; i < ticker.observers.length; i++) {
        ticker.observers[i](ticker) // Notify observers
      }
    }
  }
  return ticker
}

function updateTickerModelConfiguration(tickerModel, data) {
  var notifyObservers = false
  if (typeof data.enabled != "undefined") {
    if (data.enabled != tickerModel.enabled) {
      notifyObservers = true
      tickerModel.enabled = data.enabled ? true : false
    }
  }
  if (data.color) {
    if (data.color != tickerModel.color) {
      notifyObservers = true
    }
    tickerModel.color = data.color
  }
  if (data.fontSize) {
    if (data.fontSize != tickerModel.fontSize) {
      notifyObservers = true
    }
    tickerModel.fontSize = data.fontSize
  }
  if (data.backgroundColor) {
    if (data.backgroundColor != tickerModel.backgroundColor) {
      notifyObservers = true
    }
    tickerModel.backgroundColor = data.backgroundColor
  }
  if (data.updateInterval) {
    if (data.updateInterval != tickerModel.updateInterval) {
      notifyObservers = true
    }
    tickerModel.updateInterval = data.updateInterval
  }
  if (notifyObservers) {
    tickerModel.notifyObservers()
  }
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
    if (DEBUG) $(".ticker#"+id).text(' Getting ' + url + '-' + JSON.stringify(jsonPath))
    window.parent.postMessage({
      "id" : id,
      "url" : url,
      "jsonPath" : JSON.stringify(jsonPath)
    }, "*");
  }
}

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
    "text": 'New emtpy ticker for ' + tickerId
  })
}

// Update and style of ticker div //
function updateStyle(tickerId, color, fontSize, backgroundColor) {
  $(".ticker#"+tickerId).css('font-size', fontSize)
  $(".ticker#"+tickerId).css('color', color)
  if (backgroundColor) {
    if (backgroundColor.match(/-bg$/) == null) {
      backgroundColor += "-bg" // Append background CSS to name when missing
    }
    $(".ticker#"+tickerId).removeClass().addClass(DEFAULT_TICKER_CSS_CLASSES)
    $(".ticker#"+tickerId).addClass(backgroundColor)
  } else {
    $(".ticker#"+tickerId).removeClass().addClass(DEFAULT_TICKER_CSS_CLASSES)
  }
  /* Handle ticker size
  var body_el = document.getElementById('ticker-body');
  var client_width = body_el.clientWidth;
  var scroll_width = body_el.scrollWidth;
  if (($('#ticker-data').width() > 0) && (client_width != scroll_width)) {
    self.port.emit('increaseWidth', 1);
  }*/
}

// Controllers

function getTickerController(tickerModel) {
  var tickerController = tickers["controllers"][tickerModel.id]
  if (typeof tickerController == "undefined") {
    tickerController = createTickerController(tickerModel.id, tickerModel.updateInterval)
  }
  return tickerController
}

function createTickerController(tickerId, intervalSeconds) {
  var tickerController = {
    id: tickerId,
    updateInterval: intervalSeconds,
    timer: startAutoPriceUpdate(tickerId, intervalSeconds),
    setRequestPriceUpdateInterval: function (intervalSeconds) {
      tickerController.updateInterval = intervalSeconds
      tickerController.timer = startAutoPriceUpdate(tickerController.id, intervalSeconds)
    },
    stopAutoPriceUpdate: function () {
      if (tickerController.timer) {
        clearInterval(tickerController.timer) // Stop automatic refresh of ticker
        tickerController.timer = null
      }
    }
  }
  return tickerController
}

function startAutoPriceUpdate(tickerId, intervalSeconds) {
  var tickerController = tickers["controllers"][tickerId]
  if (tickerController) {
    tickerController.stopAutoPriceUpdate()
  }
  var timer = null
  if (intervalSeconds > 0) {
    timer = setInterval(function() {
                          getLatestData(tickerId)
                        }, (intervalSeconds * 1000)) // Start periodic auto update
  }
  return timer
}

function updateView(tickerModel) {
  var tickerId = tickerModel.id
  var tickerController = tickers["controllers"][tickerId]
  var tickerView = $(".ticker#"+tickerId)
  if (tickerView.size() != 1) {
    tickerView = null // Simplify if conditions below
  }
  if (tickerModel.enabled) {
    if (tickerController && ( tickerController.updateInterval != tickerModel.updateInterval )) {
      tickerController.setRequestPriceUpdateInterval(tickerModel.updateInterval)
    }
    if (tickerView) {
      updateStyle(tickerId, tickerModel.color, tickerModel.fontSize, tickerModel.backgroundColor)
      if (DEBUG) tickerView.text(tickerId + ' ' + tickerModel.price + ' ' + ++counter)
    }
  } else {
    if (tickerController) {
      tickerController.stopAutoPriceUpdate()
    }
    if (tickerView) {
      tickerView.remove()
    }
  }
}




/*
// Update content of ticker widget //
self.port.on("updateContent", function(new_content) { 
  if (new_content != null) {
    $('#ticker-data').text(new_content);
  }
});
*/
