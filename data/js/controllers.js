    var counter = 0 // DEBUG line TODO remove

window.addEventListener("message", handleAddonMessages, false);

function handleAddonMessages(message) {
  if (message.data.type == "updateTickerConfiguration" && (typeof message.data.data != "undefined") ) {
    updateTickerConfiguration(message.data.data)
  } else if (message.data.type == "updateTickerModelPrice") {
    updateTickerModelPrice(message.data.data)
  }
}

function updateTickerConfiguration(data) {
  var id = data.id

  // Initialize View
  tickers["views"][id] = getTickerView(id)

  // Initialize Data Model
  var tickerModel = getTickerModel(data, updateView)
  tickers["models"][id] = tickerModel

  // Initialize Controllers
  tickers["controllers"][id] = getTickerController(tickerModel)
}

function updateTickerModelPrice(data) {
  if ((typeof data.id != "undefined") && (typeof data.price != "undefined")) {
    if (tickers["models"][data.id]) {
      tickers["models"][data.id].updatePrice(data.price)
    }
  }
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
    getLatestData(tickerId) // Retrieve the first data immediately
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
      updateStyle(tickerId, tickerModel.color, tickerModel.fontSize, tickerModel.background)
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
