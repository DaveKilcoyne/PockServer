var express = require('express'),
	http = require('http'),
	io = require('socket.io'),
	path = require('path'),
	fs = require('fs'),
	sizeOf = require('image-size');

var app = express(); 

app.use(express.static(path.join(__dirname, 'public'))); 
app.get('/', function(req, res){
	res.sendfile('index.html');
});

var server = http.createServer(app),
	io = io.listen(server); 

var img_rotation;
var	img_quality;

io.on('connection', function(socket) {

	console.log('Client connected...');

	socket.on('image_name', function(data) {

		img_rotation = data.rotation;
		img_quality = data.quality;

		//First Head part
		var img_Path_Head = "public/body_2/body_2_"+img_rotation+"_"+img_quality+"_1.jpg";
		var img_Path_Head_HQ = "public/body_2/body_2_"+img_rotation+"_3_1.jpg"; //Resize to max quality size

		//Body part
		var img_Path_Body = "public/body_2/body_2_"+img_rotation+"_"+img_quality+"_2.jpg";
		var img_Path_Body_HQ = "public/body_2/body_2_"+img_rotation+"_3_2.jpg"; //Resize to max quality size

		var img_Path_LegsU = "public/body_2/body_2_"+img_rotation+"_"+img_quality+"_3.jpg";
		var img_Path_LegsU_HQ = "public/body_2/body_2_"+img_rotation+"_3_3.jpg"; //Resize to max quality size

		var img_Path_LegsL = "public/body_2/body_2_"+img_rotation+"_"+img_quality+"_4.jpg";
		var img_Path_LegsL_HQ = "public/body_2/body_2_"+img_rotation+"_3_4.jpg"; //Resize to max quality size

		imageTranfer( img_Path_Head, img_Path_Head_HQ, 'head' );
		imageTranfer( img_Path_Body, img_Path_Body_HQ, 'body' );
		imageTranfer( img_Path_LegsU, img_Path_LegsU_HQ, 'legsU' );
		imageTranfer( img_Path_LegsL, img_Path_LegsL_HQ, 'legsL' );			

		function imageTranfer(img_Path, img_Path_HQ, bodyPart) {

			sizeOf(img_Path_HQ, function(err, dimensions) {

				if (err) {
					console.log("Error getting image size...");
				} 
				else {
				
					fs.readFile(img_Path, function(err, buf) {

						if (err) {
							console.log("Error reading image file...");
						} 
						else {
							console.log('sending image: '+img_Path);
							socket.emit('image', { buffer: buf, width: dimensions.width, height: dimensions.height, bodyPart: bodyPart });
						}
					});
				}
			});
		}
		
	});
});

server.listen(3000, function(){
	console.log('listening on *:3000');
});