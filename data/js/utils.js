
// Update content of ticker widget //
self.port.on("updateContent", function(new_content) {
  if (new_content != null) {
    $('#ticker-data').text(new_content);
  }
});

// Update and style of ticker widget //
self.port.on("updateStyle", function(color, font_size, new_content) {
  $('#ticker-data').css('font-size', font_size);
  $('#ticker-data').css('color', color);
});