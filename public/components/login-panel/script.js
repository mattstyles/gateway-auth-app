(function() {

    Polymer( 'login-panel', {

        /**
         * Initial notification text string.
         * Has getter/setter for access.
         *
         * @property _notificationText
         * @type String
         * @private
         */
        _notificationText: 'This is a notification',

        /**
         * Username is attached to the user input element
         *
         * @property _username
         * @type String
         * @private
         */
        _username: '',

        /**
         * Password is attached to the password input element
         *
         * @property _password
         * @type String
         * @private
         */
        _password: '',


        /**
         * The response from the ajax request
         *
         * @type Object
         */
        res: null,


        publish: {
            /**
             * The project that gateway is protecting
             *
             * @property projectName
             * @type String
             */
            projectName: 'Project name'
        },


        /*-----------------------------------------------------------*\
         *
         *  Polymer lifecycle events
         *
        \*-----------------------------------------------------------*/


        ready: function() {
            this.bindAll( this );

            this.$.user.addEventListener( 'inputChange', this.onUserChange );
            this.$.pass.addEventListener( 'inputChange', this.onPassChange );
        },


        observe: {
            /**
             * Fires the authetication route when the login button is actioned
             */
            '$.login._loading': 'authenticate'
        },


        /*-----------------------------------------------------------*\
         *
         *  Events
         *
        \*-----------------------------------------------------------*/


        /**
         * Responds to an enter key event to start the login button loading.
         * This, in turn, is observed and fires the authentication route.
         *
         * @param event
         * @param detail
         * @param sender
         */
        onKeypress: function( event, detail, sender ) {
            if ( event.keyCode === 13 && !this.$.login._loading && this.$.login._showing ) {
                // Now start authentication by triggering an observed property
                this.$.login.showLoading();
            }
        },


        /**
         * Fires off the request for authentication
         *
         * @param old {Boolean} the previous value held on the observed property
         * @param val {Boolean} is the login button in the loading state
         */
        authenticate: function( old, val ) {
            if ( !val ) return;

            this.$.xhr.body = JSON.stringify({
                user: this._username,
                pass: this._password
            });
            this.$.xhr.contentType = 'application/json';
            this.$.xhr.url = '/login';
            this.$.xhr.go();
        },


        /**
         * Fired on successful authencation.
         * Reloads the page, whereby the actual content will be served (rather than hitting the gateway route)
         */
        onAuthSuccess: function() {
            console.log( 'on success', this.res );

            location.reload();
        },


        /**
         * Fired on authentication failure.
         * Usually this will be a 401 unauthorized, although it could be a 503 service unreachable.
         * TODO: Respond to statusCode with an appropriate error message.
         */
        onAuthFailure: function() {
            this.$.login.hideLoading();

            this.$.notification.addEventListener( 'contentUpdated', this.showOnContentUpdated );
            this.notificationText = 'Error logging in';

            // TODO: show error hint
        },


        /**
         * Fired when the username input field changes
         *
         * @param event
         */
        onUserChange: function( event ) {
            this._username = event.detail;
            this.doAnim( this.checkDetails() );
        },


        /**
         * Fired when the password input field changes
         *
         * @param event
         */
        onPassChange: function( event ) {
            this._password = event.detail;
            this.doAnim( this.checkDetails() );
        },

        /**
         * Responds to the content updated event fired by the notification bar by showing the bar now the DOM is ready
         */
        showOnContentUpdated: function() {
            this.$.notification.removeEventListener( 'contentUpdated', this.showOnContentUpdated );
            this.$.notification.show();
        },


        /*-----------------------------------------------------------*\
         *
         *  Notification Management
         *
        \*-----------------------------------------------------------*/


        /**
         * Returns the notification raw text string
         *
         * @type getter
         * @returns {String}
         */
        get notificationText() {
            return this._notificationText;
        },


        /**
         * Sets the value of the notification text string.
         * Sets in motion reflecting the text string change in the DOM.
         * If the bar is hidden then simply update the property and update the DOM.
         * If it is showing then hide it, update it and then reshow it.
         *
         * @param value {String} the text of the notification
         */
        set notificationText( value ) {
            if ( this._notificationText === value ) return;

            var self = this;

            function update( event ) {
                self.$.notification.removeEventListener( 'hideEnd', update );
                self.updateNotificationText( value );
            }

            // If the bar is showing, then hide, update and show
            if ( this.$.notification._showing ) {
                this.$.notification.addEventListener( 'hideEnd', update );
                this.$.notification.addEventListener( 'contentUpdated', this.showOnContentUpdated );
                this.$.notification.hide();
                return;
            }

            //  If we got here then the bar is currently hidden so just update the text
            this.updateNotificationText( value );
        },


        /**
         * Updates the property and reflects in the DOM
         *
         * @param value {String} the notification text to update
         */
        updateNotificationText: function( value ) {
            this._notificationText = value;
            var frag = this.splitNotificationText( value );
            this.notificationContent( frag );
        },


        /**
         * Splits the notification text into words and returns a dom fragment containing the words in spans
         *
         * @param text {String} the notification text
         * @returns {DOMFragment} should be full of spans
         */
        splitNotificationText: function( text ) {
            var el = null,
                words = text.split( ' ' ),
                fragment = document.createDocumentFragment();

            words.forEach( function( word ) {
                el = document.createElement( 'span' );
                el.innerHTML = word + '&nbsp;';
                fragment.appendChild( el );
                el = null;
            });

            return fragment;
        },


        /**
         * Replaces the DOM for the notification bar contents.
         * Expects all elements to be spans.
         *
         * @param fragment {DOMFragment} the DOM to replace with
         */
        notificationContent: function( fragment ) {
            if ( !fragment ) {
                console.log( 'Error:', 'notification fragment not supplied' );
                return;
            }

            var list = this.$.notification.querySelectorAll( 'span' );

            // Remove all of the existing spans
            Array.prototype.forEach.call( list, function( el ) {
                this.$.notification.removeChild( el );
            }.bind( this ) );

            // Append the DOM fragment
            this.$.notification.appendChild( fragment );
        },



        /*-----------------------------------------------------------*\
         *
         *  Helpers
         *
        \*-----------------------------------------------------------*/


        /**
         * Simple, dirty bindAll implementation
         *
         * @param ctx {Object} the context to bind `this` to
         */
        bindAll: function( ctx ) {
            for ( method in this ) {
                if ( typeof this[ method ] === 'function' && !this.hasOwnProperty( method ) ) {
                    try {
                        this[ method ] = this[ method ].bind( ctx );
                    } catch( err ) {
                        console.log( 'login-panel:: method binding error', method, err );
                    }
                }
            }
        },


        /**
         * Fired in response to input field manipulation.
         * Handles the login button state.
         *
         * @param flag {Boolean} should the login button be showing?
         */
        doAnim: function( flag ) {
            if ( this.$.login._loading ) return;

            this.$.notification.hide();

            flag
                ? this.$.login.show()
                : this.$.login.hide();
        },


        /**
         * Checks the validity of the username and password fields
         *
         * returns {Boolean}
         */
        checkDetails: function() {
            return ( this._username.length && this._password.length );
        },



    });

})();
