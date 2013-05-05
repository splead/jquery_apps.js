/*!
 * jquery_apps.js v1.0.1
 * http://jquery-apps.appspot.com/
 *
 * Copyright (c) 2012, Splead Inc.
 * http://www.splead.co.jp/
 * 
 * Released under the MIT license.
 * https://github.com/splead/jquery_apps.js/blob/master/license.txt
 * 
 */

(function( $ ){
	
	var methods = {
		
		render: function( api, params, callback ) {
			methodRender( this, api, params, callback );
			return this;
		},
		load: function( url, api, callback ) {
			methodLoad( this, url, api, callback );
			return this;
		},
		value: function( api, callback ) {
			methodValue( this, api, callback );
			return this;
		},
		post: function( api, callback ) {
			methodPost( this , api, callback );
			return this;
		}
	};
	
	
	$.fn.apps = function( method ) {
		
		if ( methods[ method ] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === "object" || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( "Method " +  method + " does not exist on jQuery.tooltip" );
		}
	};
	
	
	// methods
	
	function methodRender( self, api, params, callback ) {
		
		if( typeof params === "function" ){
			callback = params;
			params = {};
		}
		
		if ( typeof api === "string" ) {
		
			$.ajax({
				
				url: api,
				cache: false,
				data: params,
				success: function( response ) {
					
					var data;
					try {
						data = ( new Function( "return " + response ) )();
					} catch (e) {
						alert( "json error" );
						return;
					}
					
					render( self, data );
					
					if ( callback ) {
						callback.call( self, data, response );
					}
				},
				error: function( html ) {
					
					alert( "api error" );
				}
			});
			
		} else {
			
			render( self, api );
			
			if ( callback ) {
				callback.call( self, api );
			}
		}
	}
	
	
	function methodLoad( self, url, api, callback ) {
		
		self.load( url, function() {
			methodRender( self, api, callback );
		});
	}
	
	
	function methodValue( self, api, callback ) {
		
		if( typeof api === "string" ) {
			
			$.ajax( {
				url: api,
				cache: false,
				success: function( response ) {
					
					var data;
					try {
						data = ( new Function( "return " + response ) )();
					} catch (e) {
						alert( "json error" );
						return;
					}
					
					setValue( self, data );
					
					if ( callback ) {
						callback.call( self, data, response );
					}
				},
				error: function( html ) {
					
					alert( "api error" );
				}
			});
			
		} else {
			
			setValue( self, api );
			
			if ( callback ) {
				callback.call( self, api );
			}
		}
	}
	
	
	function methodPost( self, api, callback ){
		
		var formObj;
		if(self[0].nodeName == "FORM"){
			formObj = self;
		} else {
			formObj = $( "form", self );
		}
		
		$.post( api, formObj.serialize(), function( response ) {
			
			var result = JSON.parse( response );
			
			if( callback ) {
				callback.call( self, result, response );
			}
			
			return false;
		});
		
		return false;
	}
	
	
	// local functions
	
	function render( self, data, elementId ) {
		
		for ( var id in data ) {
			
			var target;
			if ( !isNaN( id ) ) {
				target = $( ".element_" + elementId + ":eq(" + id + ")", self );
				
			} else {
				target = $( "#" + id, self );
				
				if ( target.length === 0 ) {
					target = $( "." + id, self );
					
					if ( target.length === 0 ) {
						target = self;
					}
				}
				
				elementId = id;
			}
			
			var element = data[ id ];
			
			if ( element === null ) {
				
			} else if ( element instanceof Array ) {
				
				if ( element.length > 0 ) {
					
					var repeat = $( ".repeat_" + elementId, target );
					
					if ( repeat.length > 0 ) {
						var repSize = $( ".element_" + elementId, repeat.parent() ).size();
						
						if ( repSize > 0 ) {
							var repAdd = Math.ceil( element.length / repSize ) - 1;
							
							for ( var i = 0; i < repAdd; i++ ) {
								var repeatClone = repeat.clone();
								repeat.after( repeatClone );
							}
						}
						
					} else {
						var repElement = $( ".element_" + elementId, target );
						
						for ( var i = 0; i < element.length - 1; i++ ) {
							var repElementClone = repElement.clone();
							repElement.after( repElementClone );
						}
					}
					
					render( target, element, id );
					
				} else {
					$( ".repeat_" + elementId, target ).css( "display", "none" );
					$( ".element_" + elementId, target ).css( "display", "none" );
				}
				
			} else if ( typeof element === "object" ) {
				
				for ( var key in element ) {
					
					var value = element[ key ];
					
					if ( value === null ) {
						target.each( function() {
							var html = $( this ).html();
							if ( html != null ) {
								var reg1 = new RegExp( "<!-- #"+ elementId + ":" + key + "# -->", "g" );
								var reg2 = new RegExp( "<!-- %"+ elementId + ":" + key + "% -->", "g" );
								var reg3 = new RegExp( "#" + elementId + ":" + key + "#", "g" );
								html = html.replace( reg1, "" );
								html = html.replace( reg2, "" );
								html = html.replace( reg3, "" );
								$( this ).html( html );
							}
						});
					} else if ( value instanceof Array ) {
						
						var targetItem = $( "#" + key, target );
						if ( targetItem.length === 0 ) {
							targetItem = $( "." + key, target );
							if ( targetItem.length === 0 ) {
								targetItem = target;
							}
						}
						
						if ( value.length > 0 ) {
							
							var repeat = $( ".repeat_" + key, targetItem );
							
							if ( repeat.length > 0 ) {
								var repSize = $( ".element_" + key, repeat.parent() ).size();
								if ( repSize > 0 ) {
									var repAdd = Math.ceil( value.length / repSize ) - 1;
									
									for ( var i = 0; i < repAdd; i++ ) {
										var repeatClone = repeat.clone();
										repeat.after( repeatClone );
									}
								}
								
							} else {
								var repElement = $( ".element_" + key, targetItem );
								for ( var i = 0; i < value.length - 1; i++ ) {
									var repElementClone = repElement.clone();
									repElement.after( repElementClone );
								}
							}
							
							render( targetItem, value, key );
							
						} else {
							$( ".repeat_" + elementId, targetItem ).css( "display", "none" );
							$( ".element_" + elementId, targetItem ).css( "display", "none" );
						}
						
					} else if ( typeof value === "object" ) {
						
						var item = new Object();
						item[ key ] = value;
						
						render( target, item );
						
					} else if ( typeof value === "string" || typeof value === "number" ) {
						
						target.each( function() {
							
							var html = $( this ).html();
							if ( html !== null ) {
								var reg1 = new RegExp( "<!-- #"+ elementId + ":" + key + "# -->", "g" );
								var reg2 = new RegExp( "<!-- %"+ elementId + ":" + key + "% -->", "g" );
								var reg3 = new RegExp( "#" + elementId + ":" + key + "#", "g" );
								html = html.replace( reg1, htmlESC( value ) );
								html = html.replace( reg2, value );
								html = html.replace( reg3, htmlESC( value ) );
								$( this ).html( html );
							}
						});
					}
				}
				
			} else if ( typeof element === "string" || typeof element === "number" ) {
				
				var html = target.html();
				if ( html != null ) {
					var reg1 = new RegExp( "<!-- #" + elementId + ":value# -->", "g" );
					var reg2 = new RegExp( "<!-- %" + elementId + ":value% -->", "g" );
					var reg3 = new RegExp( "#" + elementId + ":value#", "g" );
					html = html.replace( reg1, htmlESC( element ) );
					html = html.replace( reg2, element );
					html = html.replace( reg3, htmlESC( element ) );
					target.html( html );
				}
			}
		}
	}
	
	
	function setValue( self, data ) {
		
		for ( var id in data ) {
			
			var element = data[ id ];
			
			var target = $( "#" + id, self );
			
			if ( target.length === 0 ) {
				target = $( "." + id, self );
				
				if ( target.length === 0 ) {
					target = self;
				}
			}
			
			for ( var key in element ) {
				
				if ( $( "#" + key, target ).attr( "type" ) === "radio" ) {
					$( "#" + key, target ).val( [ element[ key ] ] );
				}else{
					$( "#" + key, target ).val( element[ key ] );
				}
			}
		}
	}
	
	
	function htmlESC( val ) {
		
		if ( typeof val === "string" ) {
			val = val.replace( /&/g, "&amp;" );
			val = val.replace( /</g, "&lt;" );
			val = val.replace( />/g, "&gt;" );
			val = val.replace( /"/g, "&quot;" );
			val = val.replace( /'/g, "&#039;" );
			val = val.replace( /\r\n/g, "\n" );
			val = val.replace( /\n/g, "<br />" );
			return val;
			
		} else if ( typeof val === "number" ) {
			return val;
		}
		
		return "";
	}
	
})( jQuery );
