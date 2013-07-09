var randomDate = function(start, end) {
    var value = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),
    	month = value.getMonth() + 1,
    	modMonth = '0' + month,
    	year = value.getUTCFullYear(),
    	date = '0' + value.getDate()
	return year + '-' + modMonth.slice(-2) + "-" + date.slice(-2);
};

(function() {
	var fullScreenApi = { 
			supportsFullScreen: false,
			isFullScreen: function() { return false; }, 
			requestFullScreen: function() {}, 
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if (typeof document.cancelFullScreen != 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {	 
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
			fullScreenApi.prefix = browserPrefixes[i];
			
			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
				fullScreenApi.supportsFullScreen = true;
				
				break;
			}
		}
	}
	
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		
		fullScreenApi.isFullScreen = function() {
			switch (this.prefix) {	
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		}
		fullScreenApi.requestFullScreen = function(el) {
			return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
		}
		fullScreenApi.cancelFullScreen = function(el) {
			return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
		}		
	}

	// jQuery plugin
	if (typeof jQuery != 'undefined') {
		jQuery.fn.requestFullScreen = function() {
	
			return this.each(function() {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;	
})();

$(document).keydown(function(event) {
  if (event.which == 70) {
    window.fullScreenApi.requestFullScreen($("html").get(0))
  }
});

var images = [],
    readyForMore = true,
    someDate = randomDate(new Date(2012, 0, 1), new Date()),
    page = 0;

var append = function() {
  var photo = images[0]
  
  if (window.location.hash == "#nsfw") {
      var str = "<img src=\"http://i.imgur.com/" + photo.hash + "h" + photo.ext + "\" onload=\"nextImage()\" class=\"hidden\">"
  } else {
      var str = "<img src=\"http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_b.jpg\" onload=\"nextImage()\" class=\"hidden\">"
  }

  $("section").append(str)
  images.shift()
}

var getPhotos = function() {
  if (readyForMore == true) {
      readyForMore = false;
      page++;
      
      // Custom shit
      if (window.location.hash == "#nsfw") {
        url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + "http://imgur.com/r/highresnsfw/page/" + page + ".json?format=jsonp&callback=?" + '"') + '&format=json&callback=?';
        
      } else {
        url = "http://api.flickr.com/services/rest/?format=json&method=flickr.interestingness.getList&api_key=fcbb0d352e5715c62d9b76293a69f2cc&date=" + someDate + "&per_page=25&page=" + page + "&format=json&jsoncallback=?"
      }

      $($("section img")[$("section img").length - 1]).addClass("ready");

    $.getJSON(url, function(data){
      console.log(data)
      
      // Moar custom shit
      if (window.location.hash == "#nsfw") {
        var photo = JSON.parse(data.query.results.body.p).data
        console.log(photo)
      } else {
        var photo = data.photos.photo
      }
      
      $(photo).each(function(){
        images.push(this);
      });

      append(photo[0]);
      
      $('section').masonry({
        columnWidth: 480
      });
    });
  }
}

var nextImage = function() {

  $("img").addClass("ready");

  if (images.length > 0) {
    $('section').masonry('reload');
    append(images[0]);
  } else {
    $('section').masonry('reload');
    readyForMore = true
  }
}

// Initialize
getPhotos();

$("html, body").add(window).scroll(function(){
  if ($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
    getPhotos();
  }
});