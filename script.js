var randomDate = function(start, end) {
    var value = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),
    	month = value.getMonth() + 1,
    	modMonth = '0' + month,
    	year = value.getUTCFullYear(),
    	date = '0' + value.getDate()
	return year + '-' + modMonth.slice(-2) + "-" + date.slice(-2);
}

var images = [],
    readyForMore = true,
    someDate = randomDate(new Date(2012, 0, 1), new Date()),
    page = 0;

var append = function() {
  var photo = images[0]
  
  if (window.location.hash == "#nsfw") {
      var str = "<img src=\"http://i.imgur.com/" + photo.hash + photo.ext + "\" onload=\"nextImage()\" class=\"hidden\">"
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