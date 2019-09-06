
var totalAdd ,totalFaild,totalLike = 0 ;
 
var tinderToken = localStorage.getItem("TinderWeb/APIToken");
var primeAppsToken ="Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkY5QjA2M0IwRENENTk5OTJDNjdEMzIzOTlFNUY1MjZERTg4RUQzREMiLCJ0eXAiOiJKV1QiLCJ4NXQiOiItYkJqc056Vm1aTEdmVEk1bmw5U2JlaU8wOXcifQ.eyJuYmYiOjE1Njc3MTk0MTQsImV4cCI6MTU2ODU4MzQxNCwiaXNzIjoiaHR0cHM6Ly9hdXRoLXByZXZpZXcucHJpbWVhcHBzLmlvIiwiYXVkIjpbImh0dHBzOi8vYXV0aC1wcmV2aWV3LnByaW1lYXBwcy5pby9yZXNvdXJjZXMiLCJhcGkxIl0sImNsaWVudF9pZCI6InByaW1lYXBwc19wcmV2aWV3Iiwic3ViIjoiN2I2ZjMyYjUtMTNhNy00ODU4LWE3MzAtYWJkMWMyZWZhMmUzIiwiYXV0aF90aW1lIjoxNTY3NzE5NDE0LCJpZHAiOiJsb2NhbCIsImVtYWlsIjoidGFuZXJvemVsQHRpbmRlci5jb20iLCJlbWFpbF9jb25maXJtZWQiOiJGYWxzZSIsImV4dGVybmFsX2xvZ2luIjoiZmFsc2UiLCJzY29wZSI6WyJvcGVuaWQiLCJlbWFpbCIsInByb2ZpbGUiLCJhcGkxIl0sImFtciI6WyJwd2QiXX0.b1B9MaQksttM4QYG4H-DMd6Ggjn_Zt-BVvTff9uqzyIhsZbELDoDnGBPITAj5Amvt3Qp1XsWpadUGqYZ61FBvPMzhJ-i_X0JThRvIKVZYn8dKtSX5HAjWL4KuVE4XwGuN43yaw_vX6ilacso1jbaBkqgCBiWZDjPlTUTi94O65POnNquP5I2IQcfRScHwNxKch3tfki8GJy8n8I8nVDN8H63urLhYoGvpJ4FDTSX3JJ3WYr65i3EkuHylSGMs5uYL9Xm2Ri66_U_YfSOOPM6IU9MDmzixScqEHwCDwZ0Ad3AgwTxnqOXWY7gH3wc7TKS9Qg146mhT1_YQ3cUx7bLSg";
 
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
              ++totalAdd;
              console.table(dta.body);
              console.log('%c EKLENDİ ', 'background: #222; color: #bada55');
              console.log('%c'+totalAdd+' kişi ', 'background: #222; color: #28a745');
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
          console.log(result);
          console.log('%c'+totalLike+' kişi beğenildi ', 'background: #222; color: #28a745');
      });

    })
  }

}
 //tinder.getTinderUsers(tinderRequestData);

setInterval(function () { tinder.getTinderUsers(tinderRequestData); }, 10000);


 
