;(function($) {
	var app = {
		init: function() {
			this.facebook.init();
			this.nav.init();
			this.ship.init();
			this.debug();
		}, // app.init()
		opts: {
			date: "jan",
			debug: false,
			fbresponse: null
		},// app.opts{}
		debug: function() {
			// add the key &debug to the URL for debug mode.
			// debug mode just console logs out objects
			var regex = new RegExp( "[\\?&]debug([^&#]*)" );
			var debug = regex.exec( location.search );
			if ( debug !== null ) {
				this.opts.debug = true;
			}
		}, // app.debug();
		facebook: {
			init: function() {
				var self = this;
				this.load(function() {
					FB.init(self.config);
				});
			}, //app.facebook.init();
			config: {
				appId: 439670099504894,
				cookie: true,
				status: true,
				xfbml: true,
				version: "v2.1"
			},// app.facebook.config {}
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
			utils: {
				login: function() {
					var self = this;
					if ( app.opts.fbresponse === null ) {
						FB.login(function() {
							self.checkLoginState();
						}, {
							scope: "public_profile"
						});
					}
				},
				checkLoginState: function() {
					var self = this;
					FB.getLoginStatus(function(response) {
						self.statusChangeCallback(response);
					});
				},
				getAcctInfo: function(id, callback) {
					var data = {};
					FB.api("/" + id, function(response){
						data.acct = response;
					});
					FB.api("/" + id + "/picture", function(response){
						data.img = response.data;
					});
					callback();
				},
				statusChangeCallback: function(response) {
					if (response.status === 'connected') {
						// Logged into your app and Facebook.
						this.getAcctInfo(response.authResponse.userID, function(data){
							app.opts.fbresponse = data;
							$(".fb-login").addClass("logged-in");
						});
					} else if (response.status === 'not_authorized') {
						$(".fb-login").removeClass("logged-in");
					} else {
						$(".fb-login").removeClass("logged-in");
					}
				}// app.facebook.utils.statusChangeCallback();
			}// app.facebook.utils{}
		}, // app.facebook {}
		nav: {
			init: function() {
				this.hash();
				this.events();
			},// app.ship.nav.init();
			hash: function() {
				var hash = window.location.hash;
				var sanitized_hash;
				var $active_page;
				if (hash) {
					sanitized_hash = hash.replace("!","");
					$active_page = $(sanitized_hash);
					$(".visible-deck").removeClass("visible-deck");
					$active_page.addClass("visible-deck");
				}
				return false;
			},
			events: function() {
				var self = this;
				window.addEventListener("hashchange", function() {
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
				post: function(params) {
					var self = this;
					$.post("/app/occupy", params)
						.done(function() {
							//once complete update with new params
							self.get(params);
						})
						.fail(function(response) {
							console.log("[POST Failure] - app.ship.occupants.post();" );
							console.log(response);
						})
					;
				},
				get: function(params) {
					// load the occupants in the current room being selected. 
					// include all necessary info such as messaging, profile pic
					// hit PHP service that returns this information
					var self = this;
					$.get("/app/occupy", params)
						.done(function(response){
							if ( response !== (null || "null") ) {
								$(".occupants").empty();
								response = JSON.parse(response);
								for ( var i = 0; i < response.length; i++ ) {
									var id = response[i].fbuser;
									app.facebook.utils.getAcctInfo(id, self.constructors.occupant);
								}
							}
							
						})
						.fail(function(response){
							console.log("[GET Failure] - app.ship.occupants.get();");
							console.log(response);
						})
						.always(function(){
							
						})
					;
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
						$this.addClass("active-room");
						$this.append(popup);
						self.get(params);
						
						$(".popup").on("click", function(evt) {
							evt.stopPropagation();
						});
						
						$(".close-popup").on("click", function(evt) {
							evt.stopPropagation();
							$(".popup").remove();
							$(".active-room").removeClass("active-room");
							$(document).off("click", ".close-popup");
						});
						
						$(".occupy").on("click", function(evt) {
							var $this = $(this);
							var params;
							evt.preventDefault();
							if ( app.opts.fbresponse ) {
								params = {
									room: $this.data("room"),
									deck: $this.data("deck"),
									user: app.opts.fbresponse,
									date: app.opts.date
								};
								self.post(params);
							}
							else {
								self.auth();
							}
						});
						
						/* To do
						 * ------------------------- *
						 * show signup btn
						 * display current occupants
						 * a few other things...I forgot really
						*/
					});
					
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
					$(".modal-container").on("click", function() {
						$("#fb-auth").removeClass("visible");
					});
					$(".modal-content").on("click", function(evt) {
						evt.stopPropagation();
					});
				}, // app.ship.occupants.events()
				auth: function() {
					var $modal_container = $("#fb-auth");
					$modal_container.addClass("visible");
				} // app.ship.ocuppants.auth();
			} // app.ship.occupants {}
		} // app.ship {}
	}; // app {}
	window.SHIPFAMFINDER = app;
})(jQuery);