$(document).ready(function() {

	var map, ll, markers = [];
	var selectShelter = false;


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
			zoom: 15,
			disableDefaultUI: true
		};
		map = new google.maps.Map(document.getElementById("map-canvas"),
			mapOptions);

		google.maps.event.addListener(map, 'idle', function(ev) {
			loadNearMe();
		});

	}
	google.maps.event.addDomListener(window, 'load', initialize);

	$("#map-hover .top .drag").click(function() {
		$("#map-hover").toggleClass("opened");
	});

	$("#map-hover-grey").click(function() {
		$("#map-hover-grey").css("opacity", 0);
		$("#map-hover-grey").toggle();
		$("#map-hover-popup").hide();
	});

	$("#bookDrop").click(function() {
		event.preventDefault();
		event.stopPropagation();

		$("#map-hover").toggleClass("opened");
		//$("#map-hover-grey").show();
		//$("#map-hover-popup").toggle();

		map.setCenter(ll);
		map.setZoom(17);

		$.getJSON("/parks/index.php?useAPI=true&ITEM_TYPE=SHELTER&limit=5000", function(data) {

			data = data.data;
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];

			for (var i = 0; i < data.length; i++) {
				var myLatlng = new google.maps.LatLng(data[i].LATITUDE, data[i].LONGITUDE);
				var marker = new google.maps.Marker({
					position: myLatlng,
					map: map,
					title: data[i].ITEM_TYPE,
					icon: 'images/shelter_sm.png'
				});
				google.maps.event.addListener(marker, "click", function(c) {

					$("#new-longitute").val(c.latLng.B);
					$("#new-latitude").val(c.latLng.k);

					$("#map-hover-grey").show();
					$("#map-hover-popup-create").toggle();

					$("#new-title").autocomplete({
						source: function(request, response) {
							$.ajax({
								url: "http://openlibrary.org/search.json?title=" + request.term,
								dataType: "JSON",
								success: function(data) {

									//console.log(data.docs.length);

									var d = [];
									for (var i = 0; i < data.docs.length; i++) {
										var vID;
										console.log(data.docs[i]);
										if (data.docs[i].isbn) {
											vID = data.docs[i].isbn[0];
										} else {
											vID = i
										}
										d[i] = {
											//id: data.docs[i].isbn[data.docs[i].isbn.length-1],
											id: vID,
											value: data.docs[i].title + ";;" + data.docs[i].author_name,
											label: data.docs[i].title
										}

									}

									//console.log(d);	

									response(d);
								}
							});
						},
						minLength: 5,
						select: function(event, ui) {
							var splits = this.value.split(";;");
							console.log(this.value);
							$("#new-title").val(splits[0]);
							$("#new-author").val(splits[1]);
							$("#isbn").val(this.id);
						},
						open: function() {
							$(this).removeClass("ui-corner-all").addClass("ui-corner-top");
						},
						close: function() {
							$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
						}
					});

				});
				marker.setMap(map);
				markers.push(marker);
			}

		});


	});

	$("#newBookForm").submit(function() {

		event.preventDefault();

		$.ajax({
			type: "POST",
			url: "/parks/addNewBook.php",
			data: $("#newBookForm").serialize(),
			success: function(d) {
				console.log(d);
				if (!d.error) {
					$("#newBookForm")[0].reset();
					$("#map-hover-popup-create").toggle();
					$("#map-hover-grey").hide();
					$("#map-hover").toggleClass("opened");
					for (var i = 0; i < markers.length; i++) {
						markers[i].setMap(null);
					}
					markers = [];
					loadNearMe();
				}
			},
			dataType: "JSON"
		});

	});

	$("#myBooks").click(function() {
		$(".sideContent .newBookForm").show();
		// $(".sideContent .topMenu ul li:first").addClass("active");
		// $(".sideContent .content").html("load content...");

		$("#bookTitle").autocomplete({
			source: function(request, response) {
				$.ajax({
					url: "http://openlibrary.org/search.json?title=" + request.term,
					dataType: "JSON",
					success: function(data) {

						//console.log(data.docs.length);

						var d = [];
						for (var i = 0; i < data.docs.length; i++) {
							var vID;
							//console.log(data.docs[i]);
							if (data.docs[i].isbn) {
								vID = data.docs[i].isbn[0];
							} else {
								vID = i
							}
							d[i] = {
								//id: data.docs[i].isbn[data.docs[i].isbn.length-1],
								id: vID,
								value: data.docs[i].title,
								label: data.docs[i].title
							}

						}

						response(d);
					}
				});
			},
			minLength: 5,
			select: function(event, ui) {
				//console.log(event.target);
				//var s = event.target.value.split(";");
				//console.log(s);
				//$("#bookTitle").val(s[0]);
				//$("#bookISBN").val(s[1]);
			},
			open: function() {
				$(this).removeClass("ui-corner-all").addClass("ui-corner-top");
			},
			close: function() {
				$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
			}
		});

	});

	$("#submitCode").click(function() {

		$.getJSON("/parks/index.php?fromTable=Books&bookCode=" + $("#bookCode").val(), function(d) {

			$("#bookCode").val("");
			$(".haveBookId").show();
			$("#bookID").html(d.data[0].bookCode);
			$(".bookUpDetails").html(d.data[0].Title);
			$(".finishedButton").html("Done reading.");

		});

	});

	$("#submitTitle").click(function() {

		$.ajax({
			type: "POST",
			url: "/parks/addNewBook.php",
			data: {
				title: $("#bookTitle").val(),
				isbn: $("#bookISBN").val()
			},
			success: function(d) {
				console.log(d);
				if (!d.error) {
					$(".haveBookId").show();
					$("#bookID").html(d.bookCode);
					$(".bookUpDetails").html(d.bookTitle);
					$(".finishedButton").html("Done reading.");
				}
			},
			dataType: "JSON"
		});

	});

	$(".finishedButton").click(function() {
		event.preventDefault();
		selectShelter = true;
		$("#map-hover").toggleClass("opened");
		$("#topBar").html("Select the shelter on the map where you have dropped your book off.").toggleClass("opened");

		map.setCenter(ll);
		map.setZoom(17);

		$.getJSON("/parks/index.php?useAPI=true&ITEM_TYPE=SHELTER&limit=5000", function(data) {

			data = data.data;
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];

			for (var i = 0; i < data.length; i++) {
				var myLatlng = new google.maps.LatLng(data[i].LATITUDE, data[i].LONGITUDE);
				var marker = new google.maps.Marker({
					position: myLatlng,
					map: map,
					title: data[i].ITEM_TYPE,
					icon: 'images/shelter_sm.png'
				});
				google.maps.event.addListener(marker, "click", function(c) {

					if (selectShelter) {
						// $("#new-longitute").val(c.latLng.B);
						// $("#new-latitude").val(c.latLng.k);
						// $("#bookID").html(d.bookCode);

						$.ajax({
							type: "POST",
							url: "/parks/addNewBook.php",
							data: {
								bookCode: $("#bookID").html(),
								latitude: c.latLng.k,
								longitude: c.latLng.B
							},
							success: function(d) {
								console.log(d);
								if (!d.error) {
									selectShelter = false;
									$("#map-hover").toggleClass("opened");
									$("#topBar").toggleClass("opened");
									$("#bookTitle").val("");
									$(".bookUpDetails").html("");
									$(".finishedButton").html("");

									loadNearMe();
								}
							},
							dataType: "JSON"
						});

					}

				});
				marker.setMap(map);
				markers.push(marker);
			}

		});
	});

	$("#nearMe").click(function() {
		loadNearMe();
		$(".newBookForm").hide();
		//$(".sideContent .newBookForm").hide();
		//$(".sideContent .content").html("load content...");
	});

	function loadNearMe() {

		// http://stackoverflow.com/questions/6910847/get-boundaries-longitude-and-latitude-from-current-zoom-google-maps
		var bounds = map.getBounds();
		var ne = bounds.getNorthEast(); // LatLng of the north-east corner
		var sw = bounds.getSouthWest(); // LatLng of the south-west corder
		var nw = new google.maps.LatLng(ne.lat(), sw.lng());
		var se = new google.maps.LatLng(sw.lat(), ne.lng());

		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];

		$.getJSON("/parks/index.php?fromTable=BookLocation&minLat=" + nw.lat() + "&maxLat=" + se.lat() + "&minLong=" + nw.lng() + "&maxLong=" + se.lng(), function(data) {

			data = data.data;
			for (var i = 0; i < data.length; i++) {
				var myLatlng = new google.maps.LatLng(data[i].Latitude, data[i].Longitude);
				var marker = new google.maps.Marker({
					position: myLatlng,
					map: map,
					title: data[i].bookID,
					icon: 'images/book_sm.png'
				});
				marker.setMap(map);
				markers.push(marker);
			}

		});


	}

});