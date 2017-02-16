/**
 * Copyright (c) 2015 neoranga55@yahoo.es
 * 
 * The MIT License (MIT)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 **/

window.addEventListener("message", handleAddonMessages, false);

function handleAddonMessages(message) {
  if (message.data.type == "updateProvidersData" && (message.data.data !== undefined) ) {
    processProvidersDataJSON(message.data.data);
  } else if (message.data.type == "updateTickerConfiguration" && (message.data.data !== undefined) ) {
    updateTickerConfiguration(message.data.id, message.data.data);
  } else if (message.data.type == "updateTickerModelPrice") {
    updateTickerModelPrice(message.data.id, message.data.data);
  }
}

function updateTickerConfiguration(id, data) {

  if (Object.keys(tickersRepository).length == 0) {
    return;
  }

  // Initialize View
  tickers["views"][id] = getTickerView(id);

  // Initialize Data Model
  var tickerModel = getTickerModel(id, data, updateTicker);
  tickers["models"][id] = tickerModel;
}

function updateTickerModelPrice(id, data) {
  if ((id !== undefined) && (data.price !== undefined)) {
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
                  tickerModel.fontSize, tickerModel.background, tickerModel.currencyName, tickerModel.noRounding);
    }
  } else {
    if (tickerView) {
      tickerView.remove();
    }
  }
}
