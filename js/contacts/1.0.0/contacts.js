define(['jquery'], function ($, undefined) {
	$.fn.randomFade = function(time) {
		alert("je");	
	}
   $('.soldier').mouseenter(function(){
   		$(this).animate({'opacity': '1'},200);
   })
   $('.soldier').mouseleave(function(){
   		$(this).animate({'opacity': '0.8'},200);
   })
});