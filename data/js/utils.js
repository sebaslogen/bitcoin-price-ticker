$(function() {
  loadTickers()
  $('.ticker').text('JS test externo')
})

function newEmptyTicker(tickerId) {
  return jQuery('<div/>', {
    id: tickerId,
    class: 'ticker',
    text: 'New emtpy ticker for ' + tickerId
  })
}

/* This may happen in the addon index.js
function loadTickers() {
  var newTicker = newEmptyTicker()
  $('#tickers-body').append(newTicker)
}*/

window.addEventListener("message", updateTicker, false);

function updateTicker(message) {
  var data = message.data
  //$('.ticker').text(data.id + " " + data.enabled + " with " + data.color)
  var ticker = $('#tickers-body').append(newEmptyTicker(data.id))
  ticker.text(ticker.text() + " " + data.enabled + " with " + data.color)
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