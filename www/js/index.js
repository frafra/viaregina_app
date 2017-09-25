var networkState;
var networkState_browser;
var bing;
var tileLayer;
var map;
var odk;
var flag_allMarkers;
var marker;
var markersAll;
var markersMy;
var localDB;

function showOnly(selector) {
    $('#allmap-stat,#change-xls,#comment,#info-map,#info-register,#map,#mymap-stat,#radio-class,#register-page,#slider-rating,#start-menu,#take-photo,.legend,.legend_b').hide();
    $(selector).show();
}

function cleanMapView() {
  //clean map view
  if (markersAll) {
      map.removeLayer(markersAll.markers_historical_cultural);
      map.removeLayer(markersAll.markers_morphological);
      map.removeLayer(markersAll.markers_touristic);
      map.removeLayer(markersAll.markers_critical);
  }
  if (markersMy) {
      map.removeLayer(markersMy.markers_historical_cultural);
      map.removeLayer(markersMy.markers_morphological);
      map.removeLayer(markersMy.markers_touristic);
      map.removeLayer(markersMy.markers_critical);
  }
  marker.closePopup();
}

function afterLangInit(){
  //initial values
  var curLatLng = [45.810991, 9.081521],
  curLatLngAccuracy = 0,
  classification = "",
  image = "",
  rating = 4,
  comment= "",
  isContributing = false; //is it in contributing mode?

  var watchId = null;
  var watchCallback_Popup = true; //true means the first time of receiving the watchPosition result

  //device information, network status, gps location
  var uuid = device.uuid;
  if (uuid == null)
    uuid = new Fingerprint().get().toString() + "-PC";
  //console.log(uuid);
  networkState = navigator.connection.type;
  networkState_browser = serverReachable();
  //console.log("network state (browser): " + networkState_browser);

  //pouchdb setting
  localDB = new PouchDB('db_local',{auto_compaction:true});
  var remotePointsURL = SETTINGS.db_points_url;
  /*localDB.changes({
    since: 'now',
    live: true
  }).on('change', function(change) {
    //handle change
  });*/

  if (remotePointsURL) {
    var opts = {live: true};
    localDB.replicate.to(remotePointsURL, opts, syncError);
  }

  function syncError(err) {
    console.log("sync error: " + err);
  }

  $("#main-page").show();
  rawXlsData = window.localStorage.getItem('xlsData'); // to check if the xlsData exists
  if (rawXlsData) {
    xlsData = JSON.parse(rawXlsData); //change the simple string to object,we need data types to construct the html
    for (var i = 0; i < xlsData.length; i++) { //yeki yeki obj haro barmidare
        currentRowi = xlsData[i];
        if (TYPES[(currentRowi["type"].trim().toUpperCase())] != undefined) {
            row = TYPES[(currentRowi["type"].trim().toUpperCase())]();
        } else {
            tmp_typ = currentRowi["type"];
            if (tmp_typ.substring(0, select_one_type.length) == select_one_type ||
                tmp_typ.substring(0, select_multi_type.length) == select_multi_type) {
                row = TYPES[(tmp_typ.trim().toUpperCase().split(" ")[0])]();
                var selectListName = tmp_typ.trim().split(" ")[1];
                /*for (i = 0; i < choiceList.length; i++) {
                 if (choiceList[i].listName == selectListName) {
                 row.setChoice(choiceList[i]);
                 break;
                 }
                 }*/
                var choice = new Choice();
                choice.setListName(selectListName);
                choice.setItems(currentRowi["choice"].items);
                choiceList.push(choice);
                row.setChoice(choice);


            } else { //not important
                row = new Row();
            }
        }
        row.rowFromObject(currentRowi);
        rowList.push(row);
    }

    startByX(); // here is the place where dynamic generator is called and start generating the html
    // This would be the start point of Dynamic generator in case there ISN'T data in xlsData local storage.
  }

  //resize map to cover whole screen
  var mapEl = $('#map');
  mapEl.height($(document).height() - mapEl.offset().top);
  var mapEl = $('.tabs');
  mapEl.height($(document).height() - mapEl.offset().top);

  map = L.map('map', {
    center: curLatLng,
    zoom: 17
  });

  //networkState_browser = serverReachable();
  if (networkState == Connection.NONE || networkState_browser == false){
    tilelayer = L.tileLayer('como_tiles/{z}/{x}/{y}.png', {
      errorTileUrl:'como_tiles/error-tile.png'
    });
    tilelayer.addTo(map);
  }
  else{
    bing = new L.BingLayer("AqSfYcbsnUwaN_5NvJfoNgNnsBfo1lYuRUKsiVdS5wQP3gMX6x8xuzrjZkWMcJQ1", {type: 'AerialWithLabels'});

    tilelayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      //minZoom:12,
      //maxZoom:17,
      subdomains:['a','b','c'],
      errorTileUrl:'como_tiles/error-tile.png'
    });
    tilelayer.addTo(map);

    /***
    GeoJSON - beginning
    ***/
    var owsRootUrl = 'http://localhost:5984/db_points_url/_design/geoJson/_list/aggregated/by_id/';
    var URL = owsRootUrl;

    var ODK = null;
    var ajax = $.ajax({
      url : URL,
      dataType : 'json',
      jsonpCallback : 'getJson',
      success : function (response){
        odk = response;
      }
    });
    /***
    GeoJSON - end
    ***/
  }

  //add offline/online events
  document.addEventListener("offline", onOffline, false);
  function onOffline() {
    //handle the offline event, change to offline map
    networkState = navigator.connection.type;
    networkState_browser = serverReachable();
    map.removeLayer(tilelayer);
    tilelayer = L.tileLayer('como_tiles/{z}/{x}/{y}.png', {
      errorTileUrl:'como_tiles/error-tile.png'
    });
    tilelayer.addTo(map);
  }
  document.addEventListener("online", onOnline, false);
  function onOnline() {
    //handle the online event, change to online map
    networkState = navigator.connection.type;
    networkState_browser = serverReachable();
    map.removeLayer(tilelayer);

    tilelayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      //minZoom:12,
      //maxZoom:17,
      subdomains:['a','b','c'],
      errorTileUrl:'como_tiles/error-tile.png'
    });
    tilelayer.addTo(map);

    /*if(remotePointsURL) {
      var opts = {live: true};
      localDB.replicate.to(remotePointsURL, opts, syncError);
    }
    function syncError() {
    }*/
  }

  function classIcon(classPOI) {
    function getClassImage(classPOI) {
      if (classPOI == null || classPOI == undefined) {
        return '';
      }
      return  '<img style="position:absolute; top:11%; left:17%; width:35px;" src="css/lib/images/markers_class/' + classPOI + '_100.png">';
    }
    var icon = L.divIcon({
      className: 'viaReginaMarker',
      iconSize: [54, 85],
      iconAnchor: [27, 97],
      popupAnchor: [0, -85],
      html: getClassImage(classPOI) + '<img style="position:absolute; top:0; left:0; width:54px;" src="img/marker_orange.png">'
    });
    return icon;
  }

  //add a marker to identify the map center
  var locationIcon = classIcon();
  marker = L.marker(curLatLng, {icon: classIcon(), draggable: true}).addTo(map);
  marker.dragging.disable();

  marker.on('dragend', function(event) {
    var latLng = event.target.getLatLng();
    curLatLng = [latLng.lat, latLng.lng];
    curLatLngAccuracy = 0; //0 (very accuate) if set by users
    if(watchId!=null){
      if (navigator.geolocation)
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  });

  //need to check GPS is enabled or not, after map and marker are defined
  setTimeout(function(){
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        function(position) {
          curLatLng = [position.coords.latitude, position.coords.longitude];
          curLatLngAccuracy = position.coords.accuracy;
          map.panTo(curLatLng);
          marker.setLatLng (curLatLng);
          if (!isContributing){
            messages_warninglocation = i18n.t('messages.warning-location');
            if(marker.getPopup()!=null)
            marker.setPopupContent(messages_warninglocation).closePopup();
            else
            marker.bindPopup(messages_warninglocation).closePopup();
          }
        },
        function(error) {
          console.log(error);
        },
        {maximumAge: 3000, timeout: 30000, enableHighAccuracy: true}
      );
    }
  }, 500);

  $('#map').append('<div id="legend" class="legend"><div>');

  L.DomEvent.disableClickPropagation(L.DomUtil.get('legend'));
  L.DomEvent.disableScrollPropagation(L.DomUtil.get('legend'));

  //start contributing
  $("#start-menu-contribute").click(function(){
    isContributing = true;
    watchCallback_Popup = true;
    cleanMapView();
    map.hasLayer(marker) || map.addLayer(marker);
    messages = i18n.t('messages.getting-location');
    if(marker.getPopup()!=null)
      marker.setPopupContent(messages).openPopup();
    else
      marker.bindPopup(messages).openPopup();

    //enabling class selection to start contributing
    showOnly("#radio-class");
    $("#rating_next").addClass("ui-disabled"); //disable "next"
    $("#class_next").addClass("ui-disabled"); //disable "next"
    $("#navbar-start,#navbar-my,#navbar-all,#navbar-about-map,#navbar-change-xls").addClass("ui-disabled"); //disable all nav bars

    $('#popupClass').css('overflow-y', 'scroll');

    //set all forms to initial values
    //$("#radio-choice-1a").prop("checked",true).checkboxradio("refresh");
    $("#radio-choice-1a, #radio-choice-1b, #radio-choice-1c, #radio-choice-1d, #radio-choice-1e, #radio-choice-1f, #radio-choice-1g, #radio-choice-2a, #radio-choice-2b, #radio-choice-2c, #radio-choice-3a, #radio-choice-3b, #radio-choice-3c, #radio-choice-3d, #radio-choice-3e, #radio-choice-4a, #radio-choice-4b").prop("checked",false).checkboxradio("refresh");
    $('#classPOI').text(i18n.t('classes.select'));
    $('#comment-input').val('');
    $('#slider1').val(4).slider('refresh');
    if(navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        function(position) {
          curLatLng = [position.coords.latitude, position.coords.longitude];
          curLatLngAccuracy = position.coords.accuracy;
          map.panTo(curLatLng);
          marker.setLatLng (curLatLng);
          if (watchCallback_Popup){
            marker.setPopupContent(i18n.t('messages.marker-popup')).openPopup();
          }
          watchCallback_Popup = false;
          marker.dragging.enable();
        },
        function(error) {
          messages_gpserror = i18n.t('messages.gps-error');
          marker.setPopupContent(messages_gpserror).openPopup();
          marker.dragging.enable();
          watchCallback_Popup = true;
        },
        {maximumAge: 3000, timeout: 15000, enableHighAccuracy: true}
      );
    }

    //set all initial values
    classification = "";
    image = "";
    rating = 4;
    comment= "";
  });

  $("#navbar-start").click(function(){
    //start the main page
    showOnly("#start-menu, #map");
    $("#navbar-start").addClass("ui-btn-active");
    $("#navbar-my,#navbar-all,#navbar-about-map,#navbar-change-xls").removeClass("ui-btn-active");
    cleanMapView();
    map.hasLayer(marker) || map.addLayer(marker);
  });

  /***
  show the user's contributions - beginning
  ***/
  $("#navbar-my").click(function(){
    $('.legend').empty();
    $('.legend_b').empty();
    $('.legend_b').remove();
    showOnly("#map");
    $("#navbar-start,#navbar-all,#navbar-about-map,#navbar-change-xls").removeClass("ui-btn-active");
    $("#navbar-my").addClass("ui-btn-active");
    addLegend(ln.language.code);
    addLegendButton();
    cleanMapView();
    map.hasLayer(marker) && map.removeLayer(marker);

    map.panTo(curLatLng);
    marker.setLatLng (curLatLng);

    //read data from the local database
    localDB.allDocs({include_docs: true, descending: true}, function(err, doc) {
      if(err){
        return;
      }
      //process all docs
      var locations=[];
      var classes=[];
      var ratings = [];
      var comments = [];
      var ids=[];
      var imageLength=[];
      var ii = 0;
      doc.rows.forEach(function(todo) {
        if(todo.doc.location!=null&&todo.doc.classification!=null){
          locations.push(todo.doc.location);
          classes.push(todo.doc.classification);
          ratings.push(todo.doc.rating);
          comments.push(todo.doc.comment);
          ids.push(todo.doc._id);
          imageLength.push(todo.doc._attachments["image.jpg"].length);
          ii++;
        }
      });

      flag_allMarkers = false;
      markersMy = vizPOIs(map, odk, locations, classes, ratings, comments, ids, imageLength, ln.language.code);
      if (ii ==0){
        $("#mymap-stat").html(i18n.t('stat.nopoint-my') +"<br><br>");
      }
      else if (ii == 1){
        $("#mymap-stat").html(i18n.t('stat.total-my') + ii + i18n.t('stat.contr-my-single') + "<br><br>");
      }
      else {
        $("#mymap-stat").html(i18n.t('stat.total-my') + ii + i18n.t('stat.contr-my-plural') + "<br><br>");
      }
      //$("#mymap-stat,.legend,.legend_b").show();
      $("#mymap-stat").show();
      resize();
    });
  });
  /***
  show the user's contributions - end
  ***/

  /***
  show the all contributions - beginning
  ***/
  $("#navbar-all").click(function(){
    $('.legend').empty();
    $('.legend_b').empty();
    $('.legend_b').remove();
    addLegend(ln.language.code);
    addLegendButton();
    cleanMapView();
    map.hasLayer(marker) && map.removeLayer(marker);

    //networkState_browser = serverReachable();
    if (networkState == Connection.NONE || networkState_browser == false){
      navigator.notification.alert(i18n.t('messages.allemomap-nointernet'), null, "Via Regina", i18n.t('messages.ok'));
      //start the main page
      showOnly("#start-menu");
      $("#navbar-start").addClass("ui-btn-active");
      $("#navbar-my,#navbar-all,#navbar-about-map,#navbar-change-xls").removeClass("ui-btn-active");
      map.hasLayer(marker) || map.addLayer(marker);
      map._onResize();
      return;
    }
    else{
      showOnly("#map");
      $("#navbar-start,#navbar-my,#navbar-about-map,#navbar-change-xls").removeClass("ui-btn-active");
      $("#navbar-all").addClass("ui-btn-active");

      map.panTo(curLatLng);
      marker.setLatLng (curLatLng);

      //read data from the server database
      var remotePointsDB = new PouchDB(remotePointsURL, {size: 50});
      remotePointsDB.allDocs({include_docs: true, descending: true}, function(err, doc) {
        if(err){
          navigator.notification.alert(i18n.t('messages.allemomap-nointernet'), null, "Via Regina", i18n.t('messages.ok') );
          //start the main page
          showOnly("#start-menu");
          $("#navbar-start").addClass("ui-btn-active");
          $("#navbar-my,#navbar-all,#navbar-about-map,#navbar-change-xls").removeClass("ui-btn-active");
          map.hasLayer(marker) || map.addLayer(marker);
          map._onResize();
          return;
        }
        else{
          var locations=[];
          var classes=[];
          var ratings=[];
          var comments=[];
          var ids=[];
          var imageLength=[];
          var ii = 0;
          doc.rows.forEach(function(todo) {
            if(todo.doc.location!=null&&todo.doc.classification!=null){
              locations.push(todo.doc.location);
              classes.push(todo.doc.classification);
              ratings.push(todo.doc.rating);
              comments.push(todo.doc.comment);
              ids.push(todo.doc._id);
              imageLength.push(todo.doc._attachments["image.jpg"].length);
              ii++;
            }
          });

          flag_allMarkers = true;
          markersAll = vizPOIs(map, odk, locations, classes, ratings, comments, ids, imageLength, ln.language.code);
          generateStatusEveryone(curLatLng, locations, classes, ln.language.code); //add stat.
          //$(".legend,.legend_b,#allmap-stat").show();
          $("#allmap-stat").show();
          resize();
        }
      });
    }
  });
  /***
  show the all contributions - end
  ***/

  //change xls file
  $("#navbar-change-xls").click(function(){
      showOnly("#change-xls");
      $("#navbar-start,#navbar-my,#navbar-all,,#navbar-about-map").removeClass("ui-btn-active");
      $("#navbar-change-xls").addClass("ui-btn-active");
      cleanMapView();
  });

  //information about Via Regina - map
  $("#navbar-about-map").click(function(){
    showOnly("#info-map");
    $("#navbar-start,#navbar-my,#navbar-all,#navbar-change-xls").removeClass("ui-btn-active");
    $("#navbar-about-map").addClass("ui-btn-active");
    cleanMapView();
  });

  $("#class_cancel").click(function(){
    //go back to start page
    showOnly("#start-menu");
    $("#navbar-start,#navbar-my,#navbar-all,#navbar-about-map,#navbar-change-xls").removeClass("ui-disabled"); //enable all nav bars
    marker.setIcon(classIcon());
    messages_warninglocation = i18n.t('messages.warning-location');
    marker.setPopupContent(messages_warninglocation).closePopup();
    marker.dragging.disable();
    isContributing = false; //not in contributing mode
    if(watchId!=null){
      if (navigator.geolocation)
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  });

  $("#class_next").click(function(){
    showOnly("#slider-rating");
  });

  $("#rating_back").click(function(){
    showOnly("#radio-class");
  });

  $("#rating_next").click(function(){
   showOnly("#comment");
  });

  $("#comment_back").click(function(){
    showOnly("#slider-rating");
  });

  $("#comment_next").click(function(){
    comment =  $("#comment-input").val(); //get comment
    //console.log("comment: " + comment);
    showOnly("#take-photo");
  });

  $("#photo_back").click(function(){
    showOnly("#comment");
  });

  $("#photo_next").click(function(){
    //submit to pouchdb and couchd, add result to map, set all variables to initial values
    showOnly("");
    $("#navbar-start,#navbar-my,#navbar-all,#navbar-about-map,#navbar-change-xls").removeClass("ui-disabled"); //enable all nav bars

    var timestamp = new Date().toISOString();
    //here get LatLng of the marker
    //curLatLng=[marker.getLatLng().lat, marker.getLatLng().lng];
    var poi = {
      _id: timestamp,
      user: uuid,
      location: curLatLng,
      location_accuracy: curLatLngAccuracy,
      lang: ln.language.code,
      timestamp: timestamp,
      classification: classification,
      rating: rating,
      comment: comment,
      _attachments:
      {
        "image.jpg":
        {
          content_type:"image\/jpeg",
          data: image
        }
      }
    };
    localDB.put(poi, function callback(err, result) {
      if (!err) {
        //console.log('Successfully posted a todo!');
        //networkState_browser = serverReachable();
        if (networkState == Connection.NONE || networkState_browser == false)
        navigator.notification.alert(i18n.t('messages.contribution-success-noInternet'), alertDismissed_contributionSuccess, "Via Regina", i18n.t('messages.ok'));
        else
        navigator.notification.alert(i18n.t('messages.contribution-success'), alertDismissed_contributionSuccess, "Via Regina", i18n.t('messages.ok'));
      }
      else {
        //navigator.notification.alert(err, "Via Regina", i18n.t('messages.ok'));
        navigator.notification.alert(i18n.t('messages.storage-error'), null, "Via Regina", i18n.t('messages.ok'));
      }
    });

    if(watchId!=null){
      if (navigator.geolocation)
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }

    function alertDismissed_contributionSuccess() {
      showOnly("#start-menu");
      $("#navbar-start").addClass("ui-btn-active");
      marker.setIcon(classIcon());
      messages_warninglocation = i18n.t('messages.warning-location');
      marker.setPopupContent(messages_warninglocation).closePopup();
      isContributing = false; //not in contributing mode
      marker.dragging.disable();
      map._onResize();
    }
  });

  //get rating
  $("#slider1").bind("slidestop", function(){
    rating = $("#slider1").val();
    $("#rating_next").removeClass("ui-disabled"); //enable "next"
  });

  //get classification
  $("input[type='radio']").on("click", function(){
    classification=$(this).val();
    $("#class_next").removeClass("ui-disabled"); //enable "next"
  });

  //close popup that is listing the classes
  $('#class_ok').click(function(){
    setTimeout(function(){
      $("#popupClass").popup("close");
    },1);
  });

  //close popup that is listing the classes - for iPad
  $('#class_ok').on('click touchstart', function(){
    setTimeout(function(){
      $("#popupClass").popup("close");
    },1);
  });

  //set the text on the button to the selected class
  $("#popupClass").on('popupafterclose', function(){
    if (classification != ""){
      var idOfValue = $("input[value='"+classification+"']").attr('id');
      var labelFor =  $("label[for='"+idOfValue+"']").text();
      $('#classPOI').text(labelFor);
      marker.setIcon(classIcon(classification));
      //console.log(classification);
    }
  });

  //make the class list scrollable
  $('#popupClass').on({
    popupbeforeposition: function(e) {
      var maxHeight = $(window).height() - 20;
      $('#popupClass').css('max-height', maxHeight + 'px');
    }
  });

  /***
  IMAGE - beginning
  ***/
  //this function is called when the input loads an image
  function renderImage(file){
    var reader = new FileReader();
    reader.onload = function(event){
      var url = event.target.result;
      //console.log(url);
      image = url.substr(url.indexOf(',')+1);
      //console.log(image);
    }

    //when the file is read it triggers the onload event above
    reader.readAsDataURL(file);
  }

  //triggered when OK is clicked
  $("input[type='file']").change(function() {
    //console.log(this.files[0].size);
    renderImage(this.files[0]);
  });

  function onSuccess(imageData) {
    image = imageData;
    //console.log(image);
    //console.log("image is received");
    //var image = document.getElementById('myImage');
    //image.src = "data:image/jpeg;base64," + imageData;
  }

  function onFail(message) {
    console.log('Failed (photo) because: ' + message);
  }

  //get photo when "Take a picture..." is clicked
  $("#photo-button-take").click(function() {
    //console.log("clicked the take photo button!");
    app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    if (app){
      //console.log("app");
      navigator.camera.getPicture(onSuccess, onFail, {
        quality: 20,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA
      });
    }
    else{
      //console.log("not app, you are on browser");
      navigator.notification.alert(i18n.t('messages.photo-unavailable'), null, "Via Regina", i18n.t('messages.ok') );
    }
  });

  //get photo when "Choose an image..." is clicked
  $("#photo-button-choose").click(function() {
    //console.log("clicked the take photo button!");
    app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    if (app){
      //console.log("app");
      navigator.camera.getPicture(onSuccess, onFail, {
        quality: 30,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
      });
    }
    else{
      //console.log("not app, you are on browser");
      $('input[type="file"]').click();
    }
  });
  /***
  IMAGE - end
  ***/

  registerXlsRCallback();  // goes to Dynamic.gx.js and call registerXlsRCallback function to start processing a xls file.
  //this would be the Start point of the Dynamic generator app in case there IS xlsData in local storage

  $('#altXlsFile').on("vclick", function () {
      changeXls();
  });
}

function initialize() {
  ln.init();
  //afterLangInit();
}
