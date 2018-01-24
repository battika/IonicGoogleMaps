(function () {
    "use strict";
    angular.module('driv.regPushService', [])
                .service('regPushService', regPushSrv);

     //regPushService.$inject = ['ngGPlacesAPI'];

    function regPushSrv() {
        var GCM_SENDER_ID = 'drivstoffapp';
        var mobileServiceClient;
        var pushNotification;

        this.regPush = function (ngAzureService) {
            
            mobileServiceClient = new WindowsAzure.MobileServiceClient(ngAzureService.serviceURL);      
            var push = PushNotification.init({
                android: {
                    senderID: GCM_SENDER_ID
                },
                ios: {
                    alert: "true",
                    badge: "true",
                    sound: "true"
                },
                windows: {}
            });

            push.on('registration', function (data) {
                // Get the native platform of the device.
                var platform = device.platform;
                // Get the handle returned during registration.
                var handle = data.registrationId;
                if (isAndroid()) {
                    /*Here I'm using multiple templates. You can use only one if you want.*/
                    /*Registering the first template to receive messages with badge count*/
                    var template_badged = '{ "data" : {"message":"$(message)","badge":"#(badge)"}}';
                    mobileServiceClient.push.gcm.registerTemplate
                        (handle,
                        "my-badged-template-gcm",
                        template_badged, ['myTagA', 'myTagB', 'badged'])
                        .done(registrationSuccess, registrationFailure);

                    /*Registering the second template to receive only message*/
                    var template_prime = '{ "data" : {"message":"$(message)"}}';
                    mobileServiceClient.push.gcm.registerTemplate(
                        handle,
                        "my-non-badged-template-gcm",
                        template_prime, ['myTagA', 'myTagB', 'non-badged'])
                        .done(registrationSuccess, registrationFailure);
                }
                else if (utility.isIOS()) {
                    /*Here also I'm using multiple templates. You can use only one if you want.*/
                    /*Registering the first template to receive messages with badge count*/
                    var template_badged = '{"aps": {"alert": "$(message)","badge":"#(badge)"}}';
                    mobileServiceClient.push.apns.registerTemplate(
                          handle,
                          "my-badged-template-apns",
                          template_badged, ['myTagA', 'myTagB', 'badged'])
                        .done(registrationSuccess, registrationFailure);

                    /*Registering the second template to receive only message*/
                    var template_prime = '{"aps": {"alert": "$(message)"}}';
                    mobileServiceClient.push.apns.registerTemplate(handle,
                        "my-non-badged-template-apns",
                        template_prime, ['myTagA', 'myTagB', 'non-badged'])
                        .done(registrationSuccess, registrationFailure);
                }

                function registrationSuccess(result) {
                    console.log('Registered to azure notification hub successfully--' + result);
                }

                function registrationFailure(e) {
                    console.log('Registration failure: ' + e);
                }

                function isIOS() {
                    /*Will work only from the device and if you are developing Ionic App
                    * If you are on non-ionic platform you should use a method which identify whether iOS or Android.
                    * return navigator.userAgent.match(/iOS/i);
                    */
                    return (ionic.Platform.device().platform.match(/ios/i))
                }

                function isAndroid() {
                    /*Will work only from the device and if you are developing Ionic App
                    * If you are on non-ionic platform you should use a method which identify whether iOS or Android.
                    * return navigator.userAgent.match(/Android/i);
                    */
                    return (ionic.Platform.device().platform.match(/android/i))
                }

                //API and examples can be found from https://github.com/phonegap/phonegap-plugin-push
                pushNotification.on('notification', function (data) {
                    alert(data.message);
                });

                //pushNotification.on('error', function (e) {
                //    alert('We\'re sorry, we have a problem in sending Push Notifications');
                //    console.log('Error: ' + e.message);
                //});

            });         
        };
    };
})();