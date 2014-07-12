$(document).ready(function() {

	var map, ll;

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(gotCoords);
	} else {
		x.innerHTML = "Geolocation is not supported by this browser.";
	}

	function gotCoords(p) {
		//console.log(p);
		ll = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
	}

	function initialize() {

		if (!ll) ll = new google.maps.LatLng(-27.477807199999997, 153.0010731);

		var mapOptions = {
			center: ll,
			zoom: 14
		};
		map = new google.maps.Map(document.getElementById("map-canvas"),
			mapOptions);

	}
	google.maps.event.addDomListener(window, 'load', initialize);

	$("#map-hover .top .drag").click(function() {
		$("#map-hover").toggleClass("opened");
	});

	$("#map-hover-grey").click(function() {
		$("#map-hover-grey").css("opacity", 0);
		$("#map-hover-grey").toggle();
		$("#map-hover-popup").toggle();
	});

	$("#bookDrop").click(function() {
		event.preventDefault();
		event.stopPropagation();

		$("#map-hover").toggleClass("opened");
		$("#map-hover-grey").toggle();
		$("#map-hover-popup").toggle();

		map.setCenter(ll);
		map.setZoom(17);

		$.getJSON("/parks/index.php?useAPI=true&ITEM_TYPE=SHELTER&limit=5000", function(data) {

			data = data.data;
			for (var i = 0; i < data.length; i++) {
				var myLatlng = new google.maps.LatLng(data[i].LATITUDE, data[i].LONGITUDE);
				var marker = new google.maps.Marker({
					position: myLatlng,
					map: map,
					title: data[i].ITEM_TYPE
				});
				google.maps.event.addListener(marker, "click", function(c) {

					$("#new-longitute").val(c.latLng.B);
					$("#new-latitude").val(c.latLng.k);

					$("#map-hover-popup-create").toggle();

				});
				marker.setMap(map);
			}

		});


	});

	$("#newBookForm").submit(function(){

		event.preventDefault();

		$.ajax({
		  type: "POST",
		  url: "/parks/addNewBook.php",
		  data: $("#newBookForm").serialize(),
		  success: function(d) {
		  	console.log(d);
		  },
		  dataType: "JSON"
		});

	});

});