

var tinderToken = localStorage.getItem("TinderWeb/APIToken");
var primeAppsToken ="Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkY5QjA2M0IwRENENTk5OTJDNjdEMzIzOTlFNUY1MjZERTg4RUQzREMiLCJ0eXAiOiJKV1QiLCJ4NXQiOiItYkJqc056Vm1aTEdmVEk1bmw5U2JlaU8wOXcifQ.eyJuYmYiOjE1NjcyNDgxMDQsImV4cCI6MTU2ODExMjEwNCwiaXNzIjoiaHR0cHM6Ly9hdXRoLXByZXZpZXcucHJpbWVhcHBzLmlvIiwiYXVkIjpbImh0dHBzOi8vYXV0aC1wcmV2aWV3LnByaW1lYXBwcy5pby9yZXNvdXJjZXMiLCJhcGkxIl0sImNsaWVudF9pZCI6InByaW1lYXBwc19wcmV2aWV3Iiwic3ViIjoiN2I2ZjMyYjUtMTNhNy00ODU4LWE3MzAtYWJkMWMyZWZhMmUzIiwiYXV0aF90aW1lIjoxNTY3MjQ4MTAzLCJpZHAiOiJsb2NhbCIsImVtYWlsIjoidGFuZXJvemVsQHRpbmRlci5jb20iLCJlbWFpbF9jb25maXJtZWQiOiJGYWxzZSIsImV4dGVybmFsX2xvZ2luIjoiZmFsc2UiLCJzY29wZSI6WyJvcGVuaWQiLCJlbWFpbCIsInByb2ZpbGUiLCJhcGkxIl0sImFtciI6WyJwd2QiXX0.hoxgCUdgpNEH3iFpp28dKyRH-RGSf-45Q2PoTfcRcdDc909VMa_DIh8N3wAoztmR7b32Buwq0D5V7n663bzAEbxRiCARp3bavROcuM0npRxETGt7zqF6c-pFO_w8yjSmfYBYgtPCMqMrYUWoRn1V3dDwzD3NstfJo88SmIIhKla0BQOYPQ9vsMWFNwVvUab5fpmTy5Ksirh67LScxBYBtHLdrwOmG6SDQ0HR4-StHFlD3sWVycPnXXfNfPmrmqsB-3ApZ396iu3-1fow-6_usX_d6H7kN-oe8IGeU3V9fs5rHqCnnjWe5WpSsGtUPxLqBb9eLMY5oUDI7sSdeYsTcw";
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
              "is": user.jobs.length > 0 ? user.jobs[0].name : "",
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
    console.log(requestData);
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
          console.log(tinderId + "EKLENMEDİ");
        } else {
          fetch(this.config.primeAppsApiUrl + "/record/create/kullanicilar?timezone_offset=180", requestData).then((response) => {

            response.json().then((result) => {
              console.log(result);
              console.log(tinderId + '%c EKLENDİ ', 'background: #222; color: #bada55');

            })

          });
        }

      })

    });

  }

}
//tinder.getTinderUsers(tinderRequestData);

setInterval(function () { tinder.getTinderUsers(tinderRequestData); }, 10000);


 
