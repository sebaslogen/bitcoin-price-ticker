window.addEventListener("message", handleAddonMessages, false);

function handleAddonMessages(message) {
  if (message.data.type == "updateTickerConfiguration" && (typeof message.data.data != "undefined") ) {
    updateTickerConfiguration(message.data.id, message.data.data);
  } else if (message.data.type == "updateTickerModelPrice") {
    updateTickerModelPrice(message.data.id, message.data.data);
  }
}

function updateTickerConfiguration(id, data) {

  if (Object.keys(tickersRepository).length == 0) { // Not ready: store until ready
    preLoadtickersRepository[id] = data;
    return;
  }

  // Initialize View
  tickers["views"][id] = getTickerView(id);

  // Initialize Data Model
  var tickerModel = getTickerModel(id, data, updateTicker);
  tickers["models"][id] = tickerModel;
}

function updateTickerModelPrice(id, data) {
  if ((typeof id != "undefined") && (typeof data.price != "undefined")) {
    if (tickers["models"][id]) {
      tickers["models"][id].updatePrice(data.price);
    }
  }
}

// Controllers

function updateTicker(tickerModel) {
  var tickerId = tickerModel.id;
  var tickerView = $(".ticker#"+tickerId);
  if (tickerView.size() != 1) {
    tickerView = null; // Simplify if conditions below
  }
  if (tickerModel.enabled) {
    if (tickerView) {
      updateView(tickerId, tickerModel.price, tickerModel.exchangeName, tickerModel.currency, 
                  tickerModel.baseCurrency, tickerModel.currencyPosition, tickerModel.color,
                  tickerModel.fontSize, tickerModel.background);
    }
  } else {
    if (tickerView) {
      tickerView.remove();
    }
  }
}