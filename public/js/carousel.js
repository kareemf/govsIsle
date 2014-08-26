 jQuery( document ).ready(function( $ ) {
      $("#mainCaro .swapePanel").swipe({
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
})
/*
var myswipe= (function(){
  //var elem = document.getElementById("mainCaro");
  var elem = $("mainCaro .swapePanel");

  elem.swipe({
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
*/