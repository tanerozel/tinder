
var totalAdd = 0;
var totalFaild=0;
var totalLike = 0 ;
 
var tinderToken = localStorage.getItem("TinderWeb/APIToken");
var primeAppsToken ="Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkY5QjA2M0IwRENENTk5OTJDNjdEMzIzOTlFNUY1MjZERTg4RUQzREMiLCJ0eXAiOiJKV1QiLCJ4NXQiOiItYkJqc056Vm1aTEdmVEk1bmw5U2JlaU8wOXcifQ.eyJuYmYiOjE1Njc5NTg0MTAsImV4cCI6MTU2ODgyMjQxMCwiaXNzIjoiaHR0cHM6Ly9hdXRoLXByZXZpZXcucHJpbWVhcHBzLmlvIiwiYXVkIjpbImh0dHBzOi8vYXV0aC1wcmV2aWV3LnByaW1lYXBwcy5pby9yZXNvdXJjZXMiLCJhcGkxIl0sImNsaWVudF9pZCI6InByaW1lYXBwc19wcmV2aWV3Iiwic3ViIjoiN2I2ZjMyYjUtMTNhNy00ODU4LWE3MzAtYWJkMWMyZWZhMmUzIiwiYXV0aF90aW1lIjoxNTY3OTU4NDA5LCJpZHAiOiJsb2NhbCIsImVtYWlsIjoidGFuZXJvemVsQHRpbmRlci5jb20iLCJlbWFpbF9jb25maXJtZWQiOiJGYWxzZSIsImV4dGVybmFsX2xvZ2luIjoiZmFsc2UiLCJzY29wZSI6WyJvcGVuaWQiLCJlbWFpbCIsInByb2ZpbGUiLCJhcGkxIl0sImFtciI6WyJwd2QiXX0.Ysnxe4BFJCELGtYA0NkwcFxWOinoALn61dpMtnLjfpCiPvYTmJdAHZ-11hnY9Ry4iF7WldUPRZp1MQ_yHWDhs-7q735Di4ZcmZzmFG9JxuUHHAWr_T_Wg0LAc3Ofcp0PchQh5TjpzpVKSeOFHHEd9hB8u-Jl2L6MIy5mN8kp1DGaXJ5viqBGWDCrJGA2q-sgDVbN27jKDhjwP-d-B93hAkpaScwE7np-8Attev0fPn6uRGi5EENeOoPMOoE4t-AnTv6J_hOVmDRII95giSmsayAamXrvltyO-Z_yA_PJgp5TGO7aYMvpAqizF7ZTPcNmuqKu4arMjmycnL1NGs5Upw";
 
var tinderRequestData = {
  "headers": {
    "accept": "application/json",
    "x-auth-token": tinderToken,
  },

  "body": null,
  "method": "GET",
}

var primeAppsRequestData = {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "authorization": primeAppsToken,
    "content-type": "application/json;charset=UTF-8",
    "x-app-id": "119"
  },
  "body": "",
  "method": "POST",
}



var tinder = {
  config: {
    tinderApiUrl: "https://api.gotinder.com/v2/",
    primeAppsApiUrl: "https://preview.primeapps.io/api",
    primeAppsAppOwner: 189
  },
  getTinderUsers: function (requestData) {

    fetch(this.config.tinderApiUrl + "/recs/core", requestData).then((response) => {

      response.json().then((result) => {

        if (result.data && result.data.results) {

          result.data.results.map((item) => {

            var user = item.user;

            var userData = {
              "owner": this.config.primeAppsAppOwner,
              "isim": user.name,
              "kullanici_tinder_id": user._id,
              "bio": user.bio,
              "is": user.jobs.length > 0 ? user.jobs[0].title.name : "",
              "dogum_tarihi": user.birth_date,
              "resim": user.photos[0].url,
              "okul": user.schools.length > 0 ? user.schools[0].name : "",
              "cinsiyet": user.gender == 1 ? 'Kadın' : 'Erkek',
              "mesafe": item.distance_mi
            }

            if (user.photos) {
              var counter = 1;
              user.photos.map((photoItem) => {
                if (counter > 9)
                  return;

                ++counter;
                userData['resim' + counter] = photoItem.url;

              })

            }

            primeAppsRequestData.body = JSON.stringify(userData);

            var dta = Object.assign({}, primeAppsRequestData)
            this.addUserPrimeApps(dta, user._id);

          })

        }

      })

    });

  },
  addUserPrimeApps: function (requestData, tinderId) {
 
    var dta = Object.assign({}, primeAppsRequestData)
    var filter = {
      "fields": [
        "total_count()"
      ],
      "filters": [
        {
          "field": "kullanici_tinder_id",
          "operator": "contains",
          "value": tinderId,
          "no": 1
        }
      ],
      "limit": 1,
      "offset": 0
    }
    dta.body = JSON.stringify(filter);

    fetch(this.config.primeAppsApiUrl + "/record/find/kullanicilar", dta).then((response1) => {

      response1.json().then((result1) => {

        if (result1[0]) {
          ++totalFaild;
          console.log(tinderId + "EKLENMEDİ");
          console.log('%c'+totalFaild+' kişi ', 'background: #222; color: #fd5068');
        } else {
          fetch(this.config.primeAppsApiUrl + "/record/create/kullanicilar?timezone_offset=180", requestData).then((response) => {

            response.json().then((result) => {
              totalAdd++;
              console.table(dta.body);           
              console.log('%c'+totalAdd+' EKLENDİ ', 'background: #222; color: #28a745');
              this.userLikeTinder(tinderId);
            })

          });
        }

      })

    });

  },
  userLikeTinder:function(tinderId){
    if(!tinderId){
      console.log("tinderId bulunamadı");
      return false;
    }
     
    fetch("https://api.gotinder.com/like/"+tinderId+"?locale=tr",tinderRequestData).then((response) => {
      response.json().then((result) => {
         ++totalLike;
        
          console.log('%c'+totalLike+' kişi beğenildi ', 'background: #222; color: #28a745');
          console.log(result);
      });

    })
  }

}
 //tinder.getTinderUsers(tinderRequestData);

setInterval(function () { tinder.getTinderUsers(tinderRequestData); }, 10000);


 
