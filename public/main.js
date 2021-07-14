/* TIME AND DATE */

function formatAMPM() {
var d = new Date(),
    minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
    ampm = d.getHours() >= 12 ? 'PM' : 'AM',
    months = ['January','February','March','April','May','June','July','August','September','Octomber','November','December'],
    days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

return days[d.getDay()]+', '+d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear()+' <br> '+hours+':'+minutes+ ' ' + ampm;
}
document.getElementById("date").innerHTML = formatAMPM();
setInterval(formatAMPM, 1000);

// WEATHER FUNCTION

let weather = {
  apiKey: "276a438640f6243b111d6ce379ae4e18",
  fetchWeather: function (city) {
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=metric&appid=" +
        this.apiKey
    )
      .then((response) => {
        if (!response.ok) {
          alert("No weather found.");
          throw new Error("No weather found.");
        }
        return response.json();
      })
      .then((data) => this.displayWeather(data));
  },
  displayWeather: function (data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp } = data.main;
    document.querySelector(".city").innerText = "Weather in " + name;
    document.querySelector(".icon").src =
      "https://openweathermap.org/img/wn/" + icon + ".png";
    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText = temp.toFixed(0) + "°C";
    document.querySelector(".weather").classList.remove("loading");
  },
  search: function () {
    this.fetchWeather(document.querySelector(".search-bar").value);
  },
};

document.querySelector(".search button").addEventListener("click", function () {
  weather.search();
});

document
  .querySelector(".search-bar")
  .addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
      weather.search();
    }
  });

weather.fetchWeather("Galati");

/************PROCESS DATA TO/FROM Client****************************/

	
var socket = io('//192.168.1.100:3000'); //load socket.io-client and connect to the host that serves the page
window.addEventListener("load", function(){ //when page loads
  if( isMobile.any() ) {
//    alert('Mobile');  
    document.addEventListener("touchstart", ReportTouchStart, false);
    document.addEventListener("touchend", ReportTouchEnd, false);
    document.addEventListener("touchmove", TouchMove, false);
  }else{
//    alert('Desktop');  
    document.addEventListener("mouseup", ReportMouseUp, false);
    document.addEventListener("mousedown", ReportMouseDown, false);
  }
  
});

//Update gpio feedback when server changes LED state
socket.on('GPIO17', function (data) {  
//  console.log('GPIO26 function called');
//  console.log(data);
  var myJSON = JSON.stringify(data);
//  console.log(myJSON);
  document.getElementById('GPIO17').checked = data;
//  console.log('GPIO26: '+data.toString());
});


//Update gpio feedback when server changes LED state
socket.on('GPIO27', function (data) {  
//  console.log('GPIO20 function called');
//  console.log(data);
  var myJSON = JSON.stringify(data);
 // console.log(myJSON);
  document.getElementById('GPIO27').checked = data;
//  console.log('GPIO20: '+data.toString());
});

//Update gpio feedback when server changes LED state
socket.on('GPIO21', function (data) {  
  //  console.log('GPIO21 function called');
  //  console.log(data);
    var myJSON = JSON.stringify(data);
   // console.log(myJSON);
    document.getElementById('GPIO21').checked = data;
  //  console.log('GPIO21: '+data.toString());
  });

  //Update gpio feedback when server changes LED state
socket.on('GPIO22', function (data) {  
  //  console.log('GPIO22 function called');
  //  console.log(data);
    var myJSON = JSON.stringify(data);
   // console.log(myJSON);
    document.getElementById('GPIO22').checked = data;
  //  console.log('GPIO22: '+data.toString());
  });


//Update sensor feedback
socket.on('dht11', function (data) {  
    //console.log('GPIO4 function called');
    //console.log(data.temp);
    // var myJSON = JSON.stringify(data);
        document.querySelector("#temper").innerText = data.temper;
        document.querySelector("#humid").innerText = data.humid;
     
    
    
  });


function ReportTouchStart(e) {
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) { 
  // Now we know that x is defined, we are good to go.
    if (x === "GPIO17") {
 //     console.log("GPIO26 toggle");
      socket.emit("GPIO17");  // send GPIO button toggle to node.js server
    } else if (x === "GPIO27") {
 //     console.log("GPIO20 toggle");
      socket.emit("GPIO27");  // send GPIO button toggle to node.js server
    } else if (x === "GPIO21") {
      //     console.log("GPIO20 toggle");
           socket.emit("GPIO21");  // send GPIO button toggle to node.js server
    } else if (x === "GPIO22") {
      //     console.log("GPIO20 toggle");
           socket.emit("GPIO22");  // send GPIO button toggle to node.js server
    }

  }

  if (e.target.id === "GPIO17") {
    socket.emit("GPIO17", 1); 
    document.getElementById('GPIO17').checked = 1;
  } else if (e.target.id === "GPIO27") {
 //   console.log("GPIO20 pressed");
    socket.emit("GPIO27", 1); 
    document.getElementById('GPIO27').checked = 1;
  } else if (e.target.id === "GPIO21") {
    //   console.log("GPIO20 pressed");
       socket.emit("GPIO21", 1); 
       document.getElementById('GPIO21').checked = 1;
  } else if (e.target.id === "GPIO22") {
    //   console.log("GPIO20 pressed");
       socket.emit("GPIO22", 1); 
       document.getElementById('GPIO22').checked = 1;
  } 
}

function ReportTouchEnd(e) {
  if (e.target.id === "GPIO17") {
    socket.emit("GPIO17", 0); 
    document.getElementById('GPIO17').checked = 0;
  } else if (e.target.id === "GPIO27") {
    socket.emit("GPIO27", 0); 
    document.getElementById('GPIO27').checked = 0;
  } else if (e.target.id === "GPIO21") {
    socket.emit("GPIO21", 0); 
    document.getElementById('GPIO21').checked = 0;
  } else if (e.target.id === "GPIO22") {
    socket.emit("GPIO22", 0); 
    document.getElementById('GPIO22').checked = 0;
  }
}

function ReportMouseDown(e) {
  
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) { 
  // Now we know that x is defined, we are good to go.
    if (x === "GPIO17") {
 //     console.log("GPIO26 toggle");
      socket.emit("GPIO17");  // send GPIO button toggle to node.js server
    } else if (x === "GPIO27") {
//     console.log("GPIO20 toggle");
      socket.emit("GPIO27");  // send GPIO button toggle to node.js server
    } else if (x === "GPIO21") {
      //     console.log("GPIO20 toggle");
            socket.emit("GPIO21");  // send GPIO button toggle to node.js server
    } else if (x === "GPIO22") {
      //     console.log("GPIO20 toggle");
            socket.emit("GPIO22");  // send GPIO button toggle to node.js server
    }
  } 
  
  if (e.target.id === "GPIO17") {
 //   console.log("GPIO26 pressed");
    socket.emit("GPIO17", 1); 
    document.getElementById('GPIO17').checked = 1;
  } else if (e.target.id === "GPIO27") {
//    console.log("GPIO20 pressed");
    socket.emit("GPIO27", 1); 
    document.getElementById('GPIO27').checked = 1;
  } else if (e.target.id === "GPIO21") {
    //    console.log("GPIO20 pressed");
        socket.emit("GPIO21", 1); 
        document.getElementById('GPIO21').checked = 1;
  } else if (e.target.id === "GPIO22") {
    //    console.log("GPIO20 pressed");
        socket.emit("GPIO22", 1); 
        document.getElementById('GPIO22').checked = 1;
  }
}


function ReportMouseUp(e) {
  if (e.target.id === "GPIO217") {
    socket.emit("GPIO17", 0); 
    document.getElementById('GPIO17').checked = 0;
  } else if (e.target.id === "GPIO27") {
    socket.emit("GPIO27", 0); 
    document.getElementById('GPIO27').checked = 0;
  } else if (e.target.id === "GPIO21") {
    socket.emit("GPIO21", 0); 
    document.getElementById('GPIO21').checked = 0;
  } else if (e.target.id === "GPIO22") {
    socket.emit("GPIO22", 0); 
    document.getElementById('GPIO22').checked = 0;
  }
}


/** function to sense if device is a mobile device ***/
// Reference: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser

var isMobile = {
  Android: function() {
      return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
      return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};