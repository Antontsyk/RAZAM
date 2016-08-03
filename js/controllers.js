var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

function convertDateStringsToDates(input) {
    // Ignore things that aren't objects.
    if (typeof input !== "object") return input;

    for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;

        var value = input[key];
        var match;
        // Check for string properties which look like dates.
        if (typeof value === "string" && (match = value.match(regexIso8601))) {
            var milliseconds = Date.parse(match[0])
            if (!isNaN(milliseconds)) {
                input[key] = new Date(milliseconds);
            }
        } else if (typeof value === "object") {
            // Recurse into object
            convertDateStringsToDates(value);
        }
    }
}


angular.module('razam.controllers', [])

// APP
.controller('AppCtrl', function ($scope) {

})
// WALKTHROUGH
.controller('WalkthroughCtrl', function ($scope, $rootScope, $http, $state, $ionicPopup, $interval) {
    $scope.goToSignUp = function () {
        $state.go('signup');
    };

    $scope.goToForgotPassword = function () {
        $state.go('forgot-password');
    };
	
	$rootScope.user = {};

    // We need this for the form validation
    $scope.selected_tab = "";
    
    $rootScope.countries = {};
    $http.get('countries.json').success(function (response) {
		$rootScope.countries = response;
    }); 

	var lemail = window.localStorage['email'] || '';
	var lpassword = window.localStorage['password'] || '';

	if(lemail != '' && lpassword != '') {
		$rootScope.user.email = lemail;
		$rootScope.user.password = lpassword;
		
		$http({
       		url:'http://razam.tolk.by/api/login',
       		method: "POST",
       		data: {
              	'email': $rootScope.user.email,
              	'password': $rootScope.user.password
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
			    window.localStorage['email'] = $rootScope.user.email;
			    window.localStorage['password'] = $rootScope.user.password;
			
  				$rootScope.user.hash = data.hash;
  				$rootScope.user.name = data.name;
  				$rootScope.user.country = data.country;
  				$rootScope.user.city = data.city;
  				$rootScope.user.birthday = data.birthday;
  				$rootScope.user.sex = data.sex;
  				$rootScope.user.avatar = data.avatar;
  				$rootScope.user.color = data.color;
  				$rootScope.user.images = data.images;
  				
  				$http({
              			url:'http://razam.tolk.by/api/chatcount/' + $rootScope.user.hash,
			       		method: "GET"
              		}).
              		success(function(data, status, headers, config) {
              			$rootScope.unread = data.count;              			
              		});
  				
  				messageCheckTimer = $interval(function () {
              		$http({
              			url:'http://razam.tolk.by/api/chatcount/' + $rootScope.user.hash,
			       		method: "GET"
              		}).
              		success(function(data, status, headers, config) {
              			$rootScope.unread = data.count;						
              		});
          		}, 3000);
  				
  				$state.go('app.feeds-categories');
  			}
  			else {
  				var alertPopup = $ionicPopup.alert({
	     			title: 'Ошибка!',
	     			template: 'Проверьте введенные данные'
	   			});
  			}
		}).
  		error(function(data, status, headers, config) {
  			var alertPopup = $ionicPopup.alert({
     			title: 'Ошибка!',
     			template: 'Сервер временно недоступен, повторите запрос позже'
   			});
    	});
	}
	
    $scope.doLogIn = function () {
    	$http({
       		url:'http://razam.tolk.by/api/login',
       		method: "POST",
       		data: {
              	'email': $rootScope.user.email,
              	'password': $rootScope.user.password
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
			    window.localStorage['email'] = $rootScope.user.email;
			    window.localStorage['password'] = $rootScope.user.password;
			
  				$rootScope.user.hash = data.hash;
  				$rootScope.user.name = data.name;
  				$rootScope.user.country = data.country;
  				$rootScope.user.city = data.city;
  				$rootScope.user.birthday = data.birthday;
  				$rootScope.user.sex = data.sex;
  				$rootScope.user.color = data.color;
  				$rootScope.user.avatar = data.avatar;
  				$rootScope.user.images = data.images;
  				
  				$http({
              			url:'http://razam.tolk.by/api/chatcount/' + $rootScope.user.hash,
			       		method: "GET"
              		}).
              		success(function(data, status, headers, config) {
              			$rootScope.unread = data.count;
              		});
  				
  				messageCheckTimer = $interval(function () {
              		$http({
              			url:'http://razam.tolk.by/api/chatcount/' + $rootScope.user.hash,
			       		method: "GET"
              		}).
              		success(function(data, status, headers, config) {
              			$rootScope.unread = data.count;
              		});
          		}, 3000);
  				
  				$state.go('app.feeds-categories');
  			}
  			else {
  				var alertPopup = $ionicPopup.alert({
	     			title: 'Ошибка!',
	     			template: 'Проверьте введенные данные'
	   			});
  			}
		}).
  		error(function(data, status, headers, config) {
  			var alertPopup = $ionicPopup.alert({
     			title: 'Ошибка!',
     			template: 'Сервер временно недоступен, повторите запрос позже'
   			});
    	});
    };

    $scope.$on('my-tabs-changed', function (event, data) {
        $scope.selected_tab = data.title;
    });
})

.controller('SignupCtrl', function ($scope, $http, $state, $ionicPopup) {
    $scope.user = {};

    $scope.user.email = "";
    $scope.user.password = "";

    $scope.doSignUp = function () {
    	$http({
       		url:'http://razam.tolk.by/api/register',
       		method:"POST",
       		data: {
              	'email': $scope.user.email,
              	'password': $scope.user.password
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
  				$state.go('app.feeds-categories');
  			}
  			else {
  				var alertPopup = $ionicPopup.alert({
	     			title: 'Ошибка!',
	     			template: 'Проверьте введенные данные'
	   			});
  			}
		}).
  		error(function(data, status, headers, config) {
  			var alertPopup = $ionicPopup.alert({
     			title: 'Ошибка!',
     			template: 'Сервер временно недоступен, повторите запрос позже'
   			});
    	});
    };

    $scope.goToLogIn = function () {
        $state.go('login');
    };
})

.controller('ForgotPasswordCtrl', function ($scope, $state, $http, $ionicPopup) {
    $scope.recoverPassword = function () {
    	$http({
       		url:'http://razam.tolk.by/api/restore',
       		method:"POST",
       		data: {
              	'email': $scope.user.email
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
  				$state.go('walkthrough');
  			}
  			else {
  				var alertPopup = $ionicPopup.alert({
	     			title: 'Ошибка!',
	     			template: 'Данный email не существует'
	   			});
  			}
		}).
  		error(function(data, status, headers, config) {
  			var alertPopup = $ionicPopup.alert({
     			title: 'Ошибка!',
     			template: 'Сервер временно недоступен, повторите запрос позже'
   			});
    	});
    };

    $scope.goToLogIn = function () {
        $state.go('walkthrough');
		$scope.user.password = "";
    };

    $scope.goToSignUp = function () {
        $state.go('signup');
		$scope.user.password = "";
    };
    $scope.user.password = "";
    $scope.user = { };
})

// FEED

//brings all feed categories
.controller('FeedsCategoriesCtrl', function ($scope, $http, $state, $rootScope) {
    $scope.feeds_categories = [];

	$scope.$on('$ionicView.enter', function () {
          $http.get('http://razam.tolk.by/api/messages?hash=' + $rootScope.user.hash).success(function (response) {
	        $scope.feeds_categories = response.messages;
	    });
     }); 
    
	$scope.goToMessage = function () {
        $state.go('app.message');
    };
})

.controller('MyMessagesCtrl', function ($scope, $http, $state, $rootScope) {
	$scope.user.id = $rootScope.user.hash;
    $scope.my_messages = [];	   
      
    $http.get('http://razam.tolk.by/api/messages/my/' + $rootScope.user.hash).success(function (response) {
        $scope.my_messages = response.messages;
        $scope.id = response.Idi;
    });
    
	$scope.goToMessage = function () {
        $state.go('app.message');
    };
})

// SETTINGS
.controller('SettingsCtrl', function ($scope, $ionicActionSheet, $state, $rootScope, $ionicPopup, $http, $ionicSlideBoxDelegate) {
	if(!$rootScope.user) {
		$state.go('walkthrough');
	}
	else{
		$scope.user = {};
	
	    $scope.user.email = $rootScope.user.email;
	    $scope.user.name = $rootScope.user.name;
	    $scope.user.country = $rootScope.user.country;
	    $scope.user.city = $rootScope.user.city;
	    $scope.user.birthday = $rootScope.user.birthday;
	    $scope.user.sex = $rootScope.user.sex;
	    
	    $scope.user.images = $rootScope.user.images;
		$ionicSlideBoxDelegate.$getByHandle('profile-slider').update();
	
	    $scope.user.newpass = "";
	    $scope.user.repeatnewpass = "";
	}
	
	$scope.countries = $rootScope.countries;
    $scope.getCities = function() {
    	for(var i = 0; i < $scope.countries.length; i++) {
    		if($scope.countries[i].name == $scope.user.country) {
    			return $scope.countries[i].cities;
    		}
    	}
    };

	$scope.$on('$ionicView.beforeEnter', function() {
$ionicSlideBoxDelegate.update();
});
	$scope.logout = function() {
		window.localStorage['email'] = '';
		window.localStorage['password'] = '';
		$scope.user.password = "";
		$scope.user.email = "";
		$state.go('walkthrough');
	}
	
	
	$scope.image = {
   		originalImage: '',
   		croppedImage: ''
	};

    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.image.originalImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };
    
    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
	
	$scope.DoDeteleImg = function() {	    
		$http({
       		url:'http://razam.tolk.by/api/images/delete',
       		method: "POST",
       		data: {    
                'hash': $rootScope.user.hash,			
            	'avatar': $scope.image.croppedImage            	          	
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
  				    
                    var alertPopup = $ionicPopup.alert({
	     			title: 'Успешно!',
	     			template: 'Картинка удалена!'
	   			});				
  			}
		}).
  		error(function(data, status, headers, config) {
  			var alertPopup = $ionicPopup.alert({
     			title: 'Ошибка!',
     			template: 'Сервер временно недоступен, повторите запрос позже'
   			});
    });
    };
	
	$scope.doSave = function () {
		$rootScope.user.name = $scope.user.name;
		$rootScope.user.country = $scope.user.country;
		$rootScope.user.city = $scope.user.city;
		$rootScope.user.sex = $scope.user.sex;		
		$rootScope.user.birthday = $scope.user.birthday;
		$rootScope.user.color = $scope.user.color;
		
		$http({
       		url:'http://razam.tolk.by/api/profile/save',
       		method: "POST",
       		data: {
            	'hash': $rootScope.user.hash,
				'birthday': $rootScope.user.birthday,
            	'country': $rootScope.user.country,
            	'city': $rootScope.user.city,
            	'sex': $rootScope.user.sex,            	
            	'name': $rootScope.user.name,
            	'newpass': $scope.user.newpass,
            	'repeatnewpass': $scope.user.repeatnewpass,		    
            	'avatar': !$scope.image.croppedImage ? '' : $scope.image.croppedImage,
                'color': $rootScope.user.color	
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
  				$scope.user.avatar = data.avatar;
  				$rootScope.user.avatar = data.avatar;
  				$scope.user.images = data.images;
  				$rootScope.user.images = data.images;
  				
				$ionicSlideBoxDelegate.update();
  				
  				var alertPopup = $ionicPopup.alert({
	     			title: 'Успешно!',
	     			template: 'Профиль сохранен'
	   			});
  			}
  			else {
  				var alertPopup = $ionicPopup.alert({
	     			title: 'Ошибка!', 
	     			template: 'Проверьте введенные данные'
	   			});
  			}
		}).
  		error(function(data, status, headers, config) {
  			var alertPopup = $ionicPopup.alert({
     			title: 'Ошибка!',
     			template: 'Сервер временно недоступен, повторите запрос позже'
   			});
    	});
  		$scope.user.newpass = "";	
        $scope.user.repeatnewpass = "";		
		$scope.user.password = "";		
		$state.go('app.feeds-categories');
	};
})

// FORMS
.controller('PublicProfileCtrl', function ($scope, $stateParams, $http, $rootScope, $ionicSlideBoxDelegate) {
	$scope.publicUserId = $stateParams.userId;
	
	$http.get('http://razam.tolk.by/api/publicprofile/' + $scope.publicUserId).success(function (response) {
        $scope.publicProfile = response.info;
        
        if(response.info.sex == 'Мужской') {
			$scope.publicProfile.sexicon = '♂';
		}
		else {
			$scope.publicProfile.sexicon = '♀';
		}

		$rootScope.chatId = response.info.id;
		$rootScope.chatName = response.info.name;        
		$rootScope.chatAvatar = response.info.avatar;
		
		$ionicSlideBoxDelegate.update();
    });
})

//SEARCH
// FORMS
.controller('FormsCtrl', function ($scope, $http, $state, $rootScope) {   
	$scope.DoSearch = function() {	    
		$http({
       		url:'http://razam.tolk.by/api/search',
       		method: "POST",
       		data: {            		
            	'country': $scope.search.country,
            	'city': $scope.search.city,
            	'birthday': $scope.search.birthday,
            	'sex': $scope.search.sex,            	
            	'age_from': $scope.age_from,
            	'age_to': $scope.age_to            	
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
  				$rootScope.messages = data.messages;
      			$state.go('app.messageresult');
  			}
		}).
  		error(function(data, status, headers, config) {
  			var alertPopup = $ionicPopup.alert({
     			title: 'Ошибка!',
     			template: 'Сервер временно недоступен, повторите запрос позже'
   			});
    });
    };
    
    $scope.search = {};
    $scope.search.country = "";
    $scope.search.city = "";
    $scope.search.birthday = "";
    $scope.search.sex = "";
    
    $scope.countries = $rootScope.countries;
    $scope.getCities = function() {
    	for(var i = 0; i < $scope.countries.length; i++) {
    		if($scope.countries[i].name == $scope.search.country) {
    			return $scope.countries[i].cities;
    		}
    	}
    };
})

// HOTEL
.controller('HotelCtrl', function ($scope, $state, $rootScope, $http, $ionicPopup) {     
	$scope.hotel = {};
		
	$scope.doSaveHotel = function () {
		$http({
       		url:'http://razam.tolk.by/api/hotel',
       		method: "POST",
       		data: {
			    'hash': $rootScope.user.hash,
            	'is_hotel': $scope.hotel.is_hotel,		
            	'hotel_country': $scope.hotel.hotel_country,		
            	'hotel_city': $scope.hotel.hotel_city,		
            	'hotel_place': $scope.hotel.hotel_place,		
            	'hotel_from': $scope.hotel.hotel_from,		
            	'hotel_to': $scope.hotel.hotel_to,		
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
  				var alertPopup = $ionicPopup.alert({
	     			title: 'Успешно!',
	     			template: 'Курорт сохранен'
	   			});
  			}
  			else {
  				var alertPopup = $ionicPopup.alert({
	     			title: 'Ошибка!', 
	     			template: 'Проверьте введенные данные'
	   			});
  			}
		}).
  		error(function(data, status, headers, config) {
  			var alertPopup = $ionicPopup.alert({
     			title: 'Ошибка!',
     			template: 'Сервер временно недоступен, повторите запрос позже'
   			});
    	});
  		//$scope.user.newpass = "";	        		
		
	};

	$scope.countries = $rootScope.countries;
    $scope.getCities = function() {
    	for(var i = 0; i < $scope.countries.length; i++) {
    		if($scope.countries[i].name == $scope.hotel.hotel_country) {
    			return $scope.countries[i].cities;
    		}
    	}
    };
})

// HOTEL
.controller('MessageResultCtrl', function ($scope, $state, $rootScope) {
	$scope.feeds_categories = [];

	$scope.$on('$ionicView.enter', function () {
          $scope.feeds_categories = $rootScope.messages;
      });
    
	$scope.goToMessage = function () {
        $state.go('app.message');
    };
})

// MESSAGE
.controller('MessageCtrl', function ($rootScope, $scope, $http, $state, $ionicPopup) {
	$scope.message = {};
    $scope.avatar = '';        
    $scope.message.text = "";
	
	$scope.doSend = function () {
    	$http({
       		url:'http://razam.tolk.by/api/message',
       		method: "POST",
       		data: {
              	'message': $scope.message.text,
              	'hash': $rootScope.user.hash
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
  				$state.go('app.feeds-categories', {}, { reload: true});
  			}
  			else {
  				var alertPopup = $ionicPopup.alert({
	     			title: 'Ошибка!',
	     			template: 'Проверьте введенные данные'
	   			});
  			}
		}).
  		error(function(data, status, headers, config) {
  			var alertPopup = $ionicPopup.alert({
     			title: 'Ошибка!',
     			template: 'Сервер временно недоступен, повторите запрос позже'
   			});
    	});
    };
})


// CHAT
.controller('ChatCtrl', ['$scope', '$rootScope', '$state',
  '$stateParams', 'MockService', '$ionicActionSheet', '$http',
  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
  function ($scope, $rootScope, $state, $stateParams, MockService,
    $ionicActionSheet, $http,
    $ionicPopup, $ionicScrollDelegate, $timeout, $interval) {

	$rootScope.chatId = $stateParams.userId;

	$http.get('http://razam.tolk.by/api/publicprofile/' + $rootScope.chatId).success(function (response) {
        $rootScope.chatId = response.info.id;
		$rootScope.chatName = response.info.name;
		$rootScope.chatAvatar = response.info.avatar;
		
		var x = document.getElementsByClassName("msg-header-username");  
		x[0].innerHTML = $rootScope.chatName;
		
		if(response.info.sex == 'Мужской') {
			x[0].innerHTML += ' ( ♂';
		}
		else {
			x[0].innerHTML += ' ( ♀';
		}
	});

		// mock acquiring data via $stateParams
      $scope.toUser = {
          _id: $rootScope.chatId,
          pic: 'http://m-razam.tolk.by/img/users/homer.jpg',
          username: $rootScope.chatName
      }

      // this could be on $rootScope rather than in $stateParams
      $scope.user = {
          _id: $rootScope.user.hash,
          pic: 'http://m-razam.tolk.by/img/users/homer.jpg',
          username: $rootScope.user.name,
          color: $rootScope.user.color
      };

      $scope.input = {
          message: localStorage['userMessage-' + $scope.toUser._id] || ''
      };

      var messageCheckTimer;

      var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
      var footerBar; // gets set in $ionicView.enter
      var scroller;
      var txtInput; // ^^^

      $scope.$on('$ionicView.enter', function () {
          console.log('UserMessages $ionicView.enter');

          getMessages();

          $timeout(function () {
              footerBar = document.body.querySelector('#userMessagesView .bar-footer');
              scroller = document.body.querySelector('#userMessagesView .scroll-content');
              txtInput = angular.element(footerBar.querySelector('textarea'));
          }, 0);

          messageCheckTimer = $interval(function () {
              getMessages();
          }, 2000);
      });

      $scope.$on('$ionicView.leave', function () {
          console.log('leaving UserMessages view, destroying interval');
          // Make sure that the interval is destroyed
          if (angular.isDefined(messageCheckTimer)) {
              $interval.cancel(messageCheckTimer);
              messageCheckTimer = undefined;
          }
      });

      $scope.$on('$ionicView.beforeLeave', function () {
          if (!$scope.input.message || $scope.input.message === '') {
              localStorage.removeItem('userMessage-' + $scope.toUser._id);
          }
      });

      function getMessages() {
      	$http({
       		url:'http://razam.tolk.by/api/chat/' + $rootScope.user.hash + '/' + $rootScope.chatId,
       		method: "GET"
  		}).success(function(data) {
  			$scope.doneLoading = true;
              $scope.messages = data.messages;

              $timeout(function () {
                  viewScroll.scrollBottom();
              }, 0);
  		});
      }

      $scope.$watch('input.message', function (newValue, oldValue) {
          console.log('input.message $watch, newValue ' + newValue);
          if (!newValue) newValue = '';
          localStorage['userMessage-' + $scope.toUser._id] = newValue;
      });
	  
	  $scope.anyDateToObject = function(date) {
		if(date.date == undefined) {
			return date;
		} else {
			var d = new Date(date.date);
			d.setHours(d.getHours()+date.timezone_type);
			return d;
		}
	  }

      $scope.sendMessage = function (sendMessageForm) {
          var message = {
              toId: $scope.toUser._id,
              text: $scope.input.message
          };

          // if you do a web service call this will be needed as well as before the viewScroll calls
          // you can't see the effect of this in the browser it needs to be used on a real device
          // for some reason the one time blur event is not firing in the browser but does on devices
          keepKeyboardOpen();

		$http({
       		url:'http://razam.tolk.by/api/chat/store',
       		method: "POST",
       		data: {
              	'hash': $rootScope.user.hash,
              	'message': $scope.input.message,
              	'to': $scope.toUser._id
       		}
  		}).
  		success(function(data, status, headers, config) {
  			if(data.status == 'success') {
				
	          //MockService.sendMessage(message).then(function(data) {
	          $scope.input.message = '';
	
	          message._id = data.id; // :~)
	          message.date = new Date();
	          message.username = $scope.user.username;
	          message.userId = $scope.user._id;
	          message.pic = $scope.user.picture;
	
	          $scope.messages.push(message);
	
	          $timeout(function () {
	              keepKeyboardOpen();
	              viewScroll.scrollBottom(true);
	          }, 0);
          }

          });
      };

      // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
      function keepKeyboardOpen() {
          console.log('keepKeyboardOpen');
          txtInput.one('blur', function () {
              console.log('textarea blur, focus back on it');
              txtInput[0].focus();
          });
      }

      $scope.onMessageHold = function (e, itemIndex, message) {
          console.log('onMessageHold');
          console.log('message: ' + JSON.stringify(message, null, 2));
          $ionicActionSheet.show({
              buttons: [{
                  text: 'Скопировать текст'
              }, {
                  text: 'Удалить сообщение'
              }],
              buttonClicked: function (index) {
                  switch (index) {
                      case 0: // Copy Text
                          //cordova.plugins.clipboard.copy(message.text);

                          break;
                      case 1: // Delete
                          // no server side secrets here :~)
                          $scope.messages.splice(itemIndex, 1);
                          $timeout(function () {
                              viewScroll.resize();
                          }, 0);

                          break;
                  }

                  return true;
              }
          });
      };

      // this prob seems weird here but I have reasons for this in my app, secret!
      $scope.viewProfile = function (msg) {
          if (msg.userId === $scope.user._id) {
              // go to your profile
          } else {
              // go to other users profile
          }
      };

      // I emit this event from the monospaced.elastic directive, read line 480
      $scope.$on('taResize', function (e, ta) {
          console.log('taResize');
          if (!ta) return;

          var taHeight = ta[0].offsetHeight;
          console.log('taHeight: ' + taHeight);

          if (!footerBar) return;

          var newFooterHeight = taHeight + 10;
          newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

          footerBar.style.height = newFooterHeight + 'px';
          scroller.style.bottom = newFooterHeight + 'px';
      });
     
 
     
    
     } ]);
