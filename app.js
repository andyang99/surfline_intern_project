/*
  This is the entry point for a simple web application that uses websockets
  to recieve, store, and broadcast buoy data. The data is recieved and sent
  in the JSON-RPC format. The dependencies for this application can be found in
  the 'package.json' file in the same folder.

  This application was written for Surfline/Wavetrak, Inc.

  @author Andy Yang
*/
var express = require('express'); //setting up required libraries
var app = express();
var expressWs = require('express-ws')(app);
app.set('view engine', 'ejs'); //sets view engine to ejs

app.use(express.json());

app.use(function (req, res, next) {
  req.testing = 'testing';
  return next();
});

 //buoys "class"
function Buoy(name, lat, lon)
{
  this.name = name;
  this.lat = lat;
  this.lon = lon;
  this.height = 0;
  this.period = 0;
}


var buoys = [] //array to hold list of buoys objects
var socketID_dict = {}; //dictionary to keep track of unique clients and their bounding boxes
                        //key is unique socket ID, value is the bounding box in a list (ex: [south, west, north, east])

app.get('/', function(req, res){ //renders the current buoy conditions on a map.
  res.render('map', {buoys: buoys}); //map view itself is stored in /views/map.ejs
});


app.ws('/', function(ws, req)
{

  ws.on('message', function(msg)
  {
    var socket_id = req.headers['sec-websocket-key']; //tracks client's unique socket ID

    json = JSON.parse(msg); //parses the JSON-RPC request
    method = json['method'];
    params = json['params'];
    id = json['id'];

    if (method == "addBuoy") //handles "addBuoy" requests
    {
      addBuoy(params, id); //calls helper function to store new buoy object in "buoys" array

      //loops through "socketID_dict" and sends a "buoyNotification" to all clients when appropiate
      //(part of "subscribeToBuoys" functionality )
      Object.keys(socketID_dict).forEach(function(key)
      {
        ws.id = key;
        if((params.lat > socketID_dict[key].south && params.lat < socketID_dict[key].north) && (params.lon > socketID_dict[key].west && params.lon < socketID_dict[key].east))
        {
          ws.id.send('{"rpc": "2.0", "method": "buoyNotification", "params": {"name": "' + params.name + '","lat": ' + params.lat + ',"lon": ' + params.lon + ',"height": ' + params.height + ',"period": ' + params.period + '}}');
        }
      });
      ws.send('{"rpc": "2.0", "result": "ok", "id": "' + id + '"}');
    }

    else if (method == "updateBuoyData") //handles "updateBuoyData" requests
    {
      updated_buoy = updateBuoyData(params);
      ws.send('{"rpc": "2.0", "result": "ok", "id": "' + id + '"}');

      //loops through "socketID_dict" and updates clients appropiately
      //(part of "subscribeToBuoys" functionality )
      Object.keys(socketID_dict).forEach(function(key) {
        ws.id = key;
        if((updated_buoy.lat > socketID_dict[key].south && updated_buoy.lat < socketID_dict[key].north) && (updated_buoy.lon > socketID_dict[key].west && updated_buoy.lon < socketID_dict[key].east))
        {
          ws.id.send('{"rpc": "2.0", "method": "buoyNotification", "params": {"name": ' + updated_buoy.name + ',"lat": ' + updated_buoy.lat + ',"lon": ' + updated_buoy.lon + ',"height": ' + updated_buoy.height + ',"period": ' + updated_buoy.period + '}}');
        }
      });
    }

    else if (method == "subscribeToBuoys") //handles "subscribeToBuoys" requests
    {
      socketID_dict[socket_id] = [params.south,params.west,params.north,params.east];
      send_list = subscribeToBuoys(params);
      ws.send('{"rpc": "2.0", "result": "ok", "id": "' + id + '"}');

      //sends all buoys that fall within bounding box to client
      send_list.forEach(function(element)
      {
          ws.send('{"rpc": "2.0", "method": "buoyNotification", "params": {"name": "' + element.name + '","lat": ' + element.lat + ',"lon": ' + element.lon + ',"height": ' + element.height + ',"period": ' + element.period + '}}');
      });
    }
  });
  ws.on('close', () => {
  });
});

//next 3 functions are helper functions

//saves the new buoy object into "buoys" array
function addBuoy(params)
{
  buoys.push(new Buoy(params.name, params.lat, params.lon));
}

//loops through "buoys" array and updates the correct buoy object
function updateBuoyData(params)
{
  buoys.forEach(function(element)
  {
    if(element.name == params.name)
    {

      element.height = params.height;
      element.period = params.period;
      return element;
    }
  });
}

//loops through "buoys" array and constructs a list of all buoys within the
//bounding box, then returns that list
function subscribeToBuoys(params)
{
   send_list = []

   buoys.forEach(function(element)
   {
     if((element.lat > params.south && element.lat < params.north) && (element.lon > params.west && element.lon < params.east))
     {
       send_list.push(element);
     }
   });
   return send_list;
}

//listens on port 8080
app.listen(8080);
