/*!
 * ShipFamFinder v0.1
 *
 * Copyright 2014 Kyle Milloy
 * Released under the MIT license
 * 
 */

;(function($) {
	// app is our obj wrapper for all functions
	// This makes it easy to add/remove stuff
	// as the structure is quite flexible.
	var app = {
		// initiate the app
		init: function() {
			this.facebook.init();
			this.nav.init();
			this.ship.init();
		}, // app.init()
		// basic options
		opts: {
			date: "jan",
			fbresponse: null
		},// app.opts{}
		// everything facebook related...
		facebook: {
			//init.
			init: function() {
				var self = this;
				this.load(function() {
					FB.init(self.config);
				});
			}, // app.facebook.init();
			//basic options req. by FB
			config: {
				appId: 439670099504894,
				cookie: true,
				status: true,
				xfbml: true,
				version: "v2.1"
			}, // app.facebook.config {}
			//load the FBSDK asynchornously
			load: function( callback ) {
				if ( typeof callback !== "function" ) {
					console.error("FB.load callback MUST be a function");
					return;
				}
				var js, fjs = document.getElementsByTagName( "script" )[ 0 ];
				if ( document.getElementById( "facebook-jssdk" ) ) {
					console.warn( "FBSDK already loaded" );
					return;
				}
				js = document.createElement("script");
				js.id = "facebook-jssdk";
				js.src = "//connect.facebook.net/en_US/sdk.js";
				js.addEventListener("load", function() {
					callback();
				}, false);
				fjs.parentNode.insertBefore(js, fjs);
			}, //app.facebook.load()
			//some basic utilities
			utils: {
				//login behaviour
				login: function() {
					//reference to app.facebook.utils so we 
					//don't lose scope.
					var self = this;
					if ( app.opts.fbresponse === null ) {
						//FB.login(callback, scope);
						FB.login(function() {
							self.checkLoginState();
						},{
							scope: "public_profile"
						});
					}
				},
				checkLoginState: function() {
					//reference to app.facebook.utils
					var self = this;
					//FB.getLoginStatus(callback(response));
					FB.getLoginStatus(function(response) {
						self.statusChangeCallback(response);
					});
				},
				// grab the users public profile info and 
				// an acct pic.
				getAcctInfo: function(id, callback) {
					var data = {};
					if (typeof callback !== "function" ) {
						console.warn("getAcctInfo callback needs to be a function");
						return;
					}
					//!-Todo-!// 
					// refactor with a promise instead of stacking..
					// should be firing both at the same time
					FB.api("/" + id, function(response){
						data.acct = response;
						FB.api("/" + id + "/picture", function(response){
							data.img = response.data;
							callback(data);
						});
					});
				},
				statusChangeCallback: function(response) {
					//!-Todo-!// 
					// - Not Auth state, what happens?
					// - Didn't work state, what happens?
					
					// Connection worked
					if (response.status === 'connected') {
						// Logged into your app and Facebook.
						this.getAcctInfo(response.authResponse.userID, function(data){
							app.opts.fbresponse = data;
							$(".fb-login").addClass("logged-in");
						});
					}
					// User did not auth...
					else if (response.status === 'not_authorized') {
						$(".fb-login").removeClass("logged-in");
					}
					// Failed password or other.
					else {
						$(".fb-login").removeClass("logged-in");
					}
				}// app.facebook.utils.statusChangeCallback();
			}// app.facebook.utils{}
		}, // app.facebook {}
		nav: {
			//!-Todo-!// 
			// Make this actually ajax and not faked.
			// Changing modules/ship.php should be enough
			// to get this done. Then $.load() should be
			// able to do the rest.
			init: function() {
				this.hash();
				this.events();
			},// app.ship.nav.init();
			hash: function() {
				// "ajax" navigation.
				// this gets init on load incase the
				// user comes to a deck specific link. 
				// ex: ~/#!deck-6 or something
				var hash = window.location.hash;
				var sanitized_hash;
				var $active_page;
				
				if ( hash ) {
					sanitized_hash = hash.replace("!","");
					$active_page = $(sanitized_hash);
					$(".visible-deck").removeClass("visible-deck");
					$active_page.addClass("visible-deck");
				}
				
				return false;
			},
			events: function() {
				// self marks app.nav for scope reasons.
				var self = this;
				window.addEventListener("hashchange", function() {
					// when a user changes a link inside the site
					// then update accordingly.
					self.hash();
				}, false);
			}// app.ship.nav.events();
		},// app.ship.nav {}
		ship: {
			init: function() {
				this.occupants.init();
			}, // app.ship.init()
			occupants: {
				init: function() {
					this.events();
				},// app.ship.occupants.init();
				// Adding occupants to the database via post.
				post: function(params) {
					//ref. to app.ship.occupants
					var self = this;
					// params is built and sent from app.ship.occupants.events
					// it is based on data props pulled from the html.
					$.post("/app/occupy", params)
						.done(function() {
							//once complete update the model with your name added.
							self.get(params);
						})
						.fail(function(response) {
							//throw err
							console.error("[POST Failure] - app.ship.occupants.post();" );
							console.log(response);
						})
					;
				},
				get: function(params) {
					//ref. to app.ship.occupants
					var self = this;
					//fetch names associated with a room.
					// params is built and sent from app.ship.occupants.events
					// it is based on data props pulled from the html.
					$.get("/app/occupy", params)
						.done(function(response) {
							//sometimes it gets thrown as a string...I can't remember which case
							//!-Todo-!//
							//Remember when and where it gets thrown as a string and refactor
							//should be ~/app/occupy.php
							if ( response !== (null || "null") ) {
								//clear out our popup.
								$(".occupants").empty();
								//ensure valid JSON...should probably throw an err if it's not...
								response = JSON.parse(response);
								for ( var i = 0; i < response.length; i++ ) {
									//for each person in the room, throw their ID at facebook for
									//recognition and then construct the popup
									var id = response[i].fbuser;
									app.facebook.utils.getAcctInfo(id, self.constructors.occupant);
								}
							}
							
						})
						.fail(function(response){
							console.error("[GET Failure] - app.ship.occupants.get();");
							console.log(response);
						});
					
				}, //app.ship.occupants.get()
				constructors: {
					occupant: function(obj) {
						var html = "<div id='occupant-" + obj.acct.id + "' class='occupant'>" +
										"<div class='profile-pic'>" +
											"<img src='" + obj.img.url + "' alt='" + obj.acct.name + "' />" +
										"</div>" +
										"<div class='profile-info'>" +
											"<span class='name'>" +
												obj.acct.name +
											"</span>" +
											"<a href='https://www.facebook.com/" + obj.acct.id + "' title='View profile' target='_blank'>View Profile</a>" +
										"</div>" +
									"</div>";
						$(".occupants").append(html);
					}
				}, // app.ship.occupants.constructor();
				events: function() {
					// click events to be handled such as messaging,
					// viewing their page or sending a friend request.
					var self = this;
					// add popup to room on click
					$(".room-container").on("click", function() {
						var $this         = $(this);
						var room          = $this.data("room");
						var deck          = $this.data("deck");
						var params = {
							room: room,
							deck: deck,
							date: app.opts.date
						};
						var popup         = "<div class='popup' title=''>" +
												"<div class='title'>" +
													"<span class='left' title='Deck: " + deck + ", Room: " + room + "'>L" + deck + "-R" + room + "</span>" +
													"<span class='right close-popup' title='Close'>&times;</span>" +
												"</div>" +
												"<div class='occupants no-occupants'>No occupants</div>" +
												"<div class='signup'>"+
													"<a href='#' class='occupy' data-room='" + room + "' data-deck='" + deck + "'>Occupy this room</a>" +
												"</div>"+
											"</div>";
						$(".popup").remove();
						$(".active-room").removeClass("active-room");
						$this.addClass("active-room");
						$this.append(popup);
						self.get(params);
						
						$(".popup").on("click", function(evt) {
							// prevent bubbling
							return false;
						});
						
						$(".close-popup").on("click", function() {
							//remove popup and class
							$(".popup").remove();
							$(".active-room").removeClass("active-room");
							return false;
						});
						
						$(".occupy").on("click", function() {
							var $this = $(this);
							var params;
							//check if user is logged in.
							if ( app.opts.fbresponse ) {
								params = {
									room: $this.data("room"),
									deck: $this.data("deck"),
									user: app.opts.fbresponse,
									date: app.opts.date
								};
								self.post(params);
							}
							//if not logged then ask for auth.
							else {
								self.auth();
							}
							
							return false;
						});
						
						/* To do
						 * ------------------------- *
						 * show signup btn
						 * display current occupants
						 * a few other things...I forgot really
						*/
					});
					
					//various events handlers.
					$("input[name=select-date]").on("change", function() {
						var date = $(this).val();
						app.opts.date = date;
					});
					$(".fb-login").on("click", function(evt) {
						evt.preventDefault();
						app.facebook.utils.login();
					});
					$(".modal-close").on("click", function(evt) {
						evt.preventDefault();
						$("#fb-auth").removeClass("visible");
					});
					
					//!-Todo-!
					// Change the nesting...should have a background
					// div with a fixed position to prevent this rather
					// needless modal-content bubble deterant. 
					$(".modal-container").on("click", function() {
						$("#fb-auth").removeClass("visible");
					});
					$(".modal-content").on("click", function(evt) {
						evt.stopPropagation();
					});
				}, // app.ship.occupants.events()
				//auth box popup.
				auth: function() {
					var $modal_container = $("#fb-auth");
					$modal_container.addClass("visible");
				} // app.ship.ocuppants.auth();
			} // app.ship.occupants {}
		} // app.ship {}
	}; // app {}
	window.SHIPFAMFINDER = app;
})(jQuery);