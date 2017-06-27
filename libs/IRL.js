IRL={};
IRL.supported=navigator&&navigator.geolocation;
if(IRL.supported){
    navigator.geolocation.watchPosition(function(p){
        IRL.lat=p.coords.latitude;
        IRL.lon=p.coords.longitude;
        IRL.alt=p.coords.altitude;
        IRL.speed=p.coords.speed;
        IRL.heading=p.coords.heading;
        if(!IRL.ready){
            IRL.__WEATHERUPDATE();
            IRL.ready = true;
        }
    });
    IRL.__WEATHERUPDATE=function(){
        var f = function(c){
            var w = JSON.parse(c);
            IRL.weather = w.weather[0].main;
            IRL.windspeed = w.wind.speed;
            IRL.temperature = w.main.temp;
            IRL.humidity = w.main.humidity;
            IRL.clouds = w.clouds.all;
        }, u = "http://api.openweathermap.org/data/2.5/weather?appid=d5de9b98ba4bcec9bb8fb3dabec517e7&lat="+IRL.lat+"&lon="+IRL.lon;
        if(window.jQuery){
            $.get(u, f);
        }
        else{
            var x = new XMLHttpRequest();
            x.onreadystatechange = function(){
                if(x.readyState==4&&x.status==200) f(x.responseText);
            };
            x.open("GET",u,true);
            x.send(null);
        }
        setTimeout(IRL.__WEATHERUPDATE,300000);
    }
}
