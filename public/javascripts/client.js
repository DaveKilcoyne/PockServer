$(function() {

    var canvas = document.getElementById('can');
        canvas.width = 1760;
        canvas.height = 5100;
    var ctx = canvas.getContext('2d'); 

    var temp_canvas = document.createElement('canvas');
        temp_canvas.width = 1760;
        temp_canvas.height = 5100;
    var temp_ctx = temp_canvas.getContext('2d');

    var cavas_Width = 1760;

    var head_X_Position = 0;
    var body_X_Position = 0;
    var legsU_X_Position = 0;
    var legsL_X_Position = 0;

    var img_Head_Height = 0;
    var img_Head_Width = 0;
    var img_Body_Height = 0;
    var img_Body_Width = 0;
    var img_LegsU_Height = 0;
    var img_LegsU_Width = 0;
    var img_LegsL_Height = 0;
    var img_LegsL_Width = 0;

    var bodyPart = '';

    var img_Head = new Image();
    var img_Body = new Image();
    var img_LegsU = new Image();
    var img_LegsL = new Image();

    var img_Head_Loaded_Flag = false;
    var img_Body_Loaded_Flag = false;
    var img_LegsU_Loaded_Flag = false;
    var img_LegsL_Loaded_Flag = false;

    var socket = io.connect();

    var onLoaded = function() {
        if (img_Head_Loaded_Flag && img_Body_Loaded_Flag && img_LegsU_Loaded_Flag && img_LegsL_Loaded_Flag) {

            temp_canvas.width = cavas_Width;
            temp_ctx.drawImage(img_Head, head_X_Position, 0, img_Head_Width, img_Head_Height);
            temp_ctx.drawImage(img_Body, body_X_Position, 1280, img_Body_Width, img_Body_Height);
            temp_ctx.drawImage(img_LegsU, legsU_X_Position, 2560, img_LegsU_Width, img_LegsU_Height);
            temp_ctx.drawImage(img_LegsL, legsL_X_Position, 3840, img_LegsL_Width, img_LegsL_Height);

            canvas.width = cavas_Width;
            ctx.drawImage(temp_canvas, 0, 0);
            img_Head_Loaded_Flag = false;
            img_Body_Loaded_Flag = false;
            img_LegsU_Loaded_Flag = false;
            img_LegsL_Loaded_Flag = false;
        }
    }
        
    img_Head.onload = function() {
        // ctx.clearRect(0, 0, 1760, img_Head_Height);   
        // ctx.drawImage(this, head_X_Position, 0, img_Head_Width, img_Head_Height);
        img_Head_Loaded_Flag = true
        onLoaded();
    }

    img_Body.onload = function() {
        // ctx.clearRect(0, 1280, 1760, img_Body_Height); 
        // ctx.drawImage(this, body_X_Position, 1280, img_Body_Width, img_Body_Height);
        img_Body_Loaded_Flag = true;
        onLoaded();
    }

    img_LegsU.onload = function() { 
        // ctx.clearRect(0, 2560, 1760, img_LegsU_Height);   
        // ctx.drawImage(this, legsU_X_Position, 2560, img_LegsU_Width, img_LegsU_Height);
        img_LegsU_Loaded_Flag = true;
        onLoaded();
    }

    img_LegsL.onload = function() {
        // ctx.clearRect(0, 3840, 1760, img_LegsL_Height);   
        // ctx.drawImage(this, legsL_X_Position, 3840, img_LegsL_Width, img_LegsL_Height);
        img_LegsL_Loaded_Flag = true;
        onLoaded();
    }

    socket.on('connect', function() {

        socket.emit('image_name', { rotation: 1, quality: 3});
    });

    socket.on('image', function(data) {

        console.log(data);
        bodyPart = data.bodyPart;

        if (bodyPart == 'head') {
            img_Head_Height = data.height;
            img_Head_Width = data.width;
            head_X_Position = (1760 - img_Head_Width)/2;
            base64String =  base64ArrayBuffer(data.buffer);
            img_Head.src = 'data:image/jpg;base64,' + base64String; 
        }
        else if (bodyPart == 'body') {
            img_Body_Height = data.height
            img_Body_Width = data.width;
            body_X_Position = (1760 - img_Body_Width)/2;
            base64String =  base64ArrayBuffer(data.buffer);
            img_Body.src = 'data:image/jpg;base64,' + base64String; 
        }  
        else if (bodyPart == 'legsU') {
            img_LegsU_Height = data.height
            img_LegsU_Width = data.width;
            legsU_X_Position = (1760 - img_LegsU_Width)/2;
            base64String =  base64ArrayBuffer(data.buffer);
            img_LegsU.src = 'data:image/jpg;base64,' + base64String; 
        }  
        else if (bodyPart == 'legsL') {
            img_LegsL_Height = data.height
            img_LegsL_Width = data.width;
            legsL_X_Position = (1760 - img_LegsL_Width)/2;
            base64String =  base64ArrayBuffer(data.buffer);
            img_LegsL.src = 'data:image/jpg;base64,' + base64String; 
        }
    });

    $( "#slider" ).slider({
        min: 1,
        max: 44,
        range: "min",
        value: 0,
        slide: function( event, ui ) {
            socket.emit('image_name', { rotation: ui.value, quality: 1});
        },
        change: function( event, ui ) {
            console.log(event);
            socket.emit('image_name', { rotation: ui.value, quality: 3});
        }
    });



    // Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
    // use window.btoa' step. According to my tests, this appears to be a faster approach:
    // http://jsperf.com/encoding-xhr-image-data/5

    function base64ArrayBuffer(arrayBuffer) {

        var base64    = ''
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

        var bytes         = new Uint8Array(arrayBuffer)
        var byteLength    = bytes.byteLength
        var byteRemainder = byteLength % 3
        var mainLength    = byteLength - byteRemainder

        var a, b, c, d
        var chunk

        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
            d = chunk & 63               // 63       = 2^6 - 1

            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
        }

        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength]

            a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

            // Set the 4 least significant bits to zero
            b = (chunk & 3)   << 4 // 3   = 2^2 - 1

            base64 += encodings[a] + encodings[b] + '=='
        } else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

            a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

            // Set the 2 least significant bits to zero
            c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

            base64 += encodings[a] + encodings[b] + encodings[c] + '='
        }
          
            return base64
        }


    // function arrayBufferToBase64( buffer ) {
    //     var binary = ''
    //     var bytes = new Uint8Array( buffer )
    //     var len = bytes.byteLength;
    //     for (var i = 0; i < len; i++) {
    //         binary += String.fromCharCode( bytes[ i ] )
    //     }
    //     return window.btoa( binary );
    // }

});