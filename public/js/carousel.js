$(document).ready( function() {

  $('#home-carousel').carousel({
    interval: 3000
  });

  var clickEvent = false;
  $('#home-carousel').on('click', '.nav a', function() {
    clickEvent = true;
    $('.nav li').removeClass('carousel-info');
    $(this).parent().addClass('carousel-info');

  }).on('slid.bs.carousel', function(e) {
    if(!clickEvent) {

      var count = $('#home-carousel .nav').children().length -1;
      var current = $('#home-carousel .nav li.carousel-info');
      current.removeClass('carousel-info').next().addClass('carousel-info');
      var id = parseFloat(current.data('slide-to'));
      if(count == id) {
        $('#home-carousel .nav li').first().addClass('carousel-info');
      }
    }
    clickEvent = false;
  });
});