
// Update content of ticker widget //
self.port.on("updateContent", function(new_content) {
  if (new_content != null) {
    $('#ticker-data').text(new_content);
  }
});

// Update and style of ticker widget //
self.port.on("updateStyle", function(color, font_size, gold_background, silver_background) {
  $('#ticker-data').css('font-size', font_size);
  $('#ticker-data').css('color', color);
  if (gold_background) {
    $('#ticker-data').removeClass('silver-background');
    $('#ticker-data').addClass('golden-background');
  } else if (silver_background) {
    $('#ticker-data').removeClass('golden-background');
    $('#ticker-data').addClass('silver-background');
  } else {
    $('#ticker-data').removeClass('golden-background');
    $('#ticker-data').removeClass('silver-background');
  }
});