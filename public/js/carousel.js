console.log("testing");

$(function() {    
  $('#myCarousel').carousel({
    interval: 10000
  })

  $('#myCarousel .item').each(function(){
    var next = $(this).next();
    if (!next.length) {
      next = $(this).siblings(':first');
    }
    next.children(':first-child').clone().appendTo($(this));
    
    if (next.next().length>0) {
      next.next().children(':first-child').clone().appendTo($(this));
    }
    else {
      $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
    }
  })

});


$(function() {      
  //Enable swiping...
  $("#mainCaro .swapePanel").swipe({
    //Generic swipe handler for all directions

    swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
      //$(this).text("You swiped " + direction );
      if(direction==="left"){
        //$(this).text("You swiped " + direction );
        $("#mainCaro").carousel('next');  
      }
      if(direction==="right"){
        //$(this).text("You swiped " + direction );
         $("#mainCaro").carousel('prev');  
      }
      if(direction===null){
        //$(this).text("tap not working");
      }  
    },
    excludedElements:".testtest a",

    //Default is 75px, set to 0 for demo so any distance triggers swipe
    threshold:0,
    allowPageScroll: "vertical",
    triggerOnTouchEnd : true
     
  });
});