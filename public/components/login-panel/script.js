(function() {

    Polymer( 'login-panel', {

        _notificationText: 'This is a notification',

        publish: {
            _username: '',
            _password: '',
            projectName: 'Project name',
            res: null
        },


        ready: function() {
            this.$.user.addEventListener( 'inputChange', this.onUserChange.bind( this ) );
            this.$.pass.addEventListener( 'inputChange', this.onPassChange.bind( this ) );
        },

        observe: {
            '$.login._loading': 'authenticate'
        },


        onKeypress: function( event, detail, sender ) {
            if ( event.keyCode === 13 && !this.$.login._loading && this.$.login._showing ) {
                // Now start authentication
                this.$.login.showLoading();
            }
        },


        authenticate: function( old, val ) {
            if ( !val ) return;

            console.log( 'now attempting authentication' );

            this.$.xhr.body = JSON.stringify({
                user: this._username,
                pass: this._password
            });
            this.$.xhr.contentType = 'application/json';
            this.$.xhr.url = '/login';
            this.$.xhr.go();
        },

        onAuthSuccess: function() {
            console.log( 'on success', this.res );

            location.reload();
        },

        onAuthFailure: function() {
            this.$.login.hideLoading();

            this.notificationText = 'Error logging in';
            this.$.notification.show();

            // TODO: show error hint
        },



        onUserChange: function( event ) {
            this._username = event.detail;
            this.doAnim( this.checkDetails() );
        },

        onPassChange: function( event ) {
            this._password = event.detail;
            this.doAnim( this.checkDetails() );
        },

        doAnim: function( flag ) {
            if ( this.$.login._loading ) return;

            this.$.notification.hide();


            flag
                ? this.$.login.show()
                : this.$.login.hide();
        },

        checkDetails: function() {
            return ( this._username.length && this._password.length );
        },


        get notificationText() {
            return this._notificationText;
        },

        set notificationText( value ) {
            if ( this._notificationText === value ) return;

            // TODO: sort this out properly
            var self = this;

            function update( event ) {
                self.$.notification.removeEventListener( 'hideEnd', update );
                self._notificationText = value;
                self.updateNotificationText( value );
                self.$.notification.show();
            }

            // If the bar is showing, then hide, update and show
            if ( this.$.notification._showing ) {
                this.$.notification.addEventListener( 'hideEnd', update );
                this.$.notification.hide();
                return;
            }

            //  If we got here then the bar is currently hidden so just update the text
            this._notificationText = value;
            this.updateNotificationText( value );
        },

        updateNotificationText: function( value ) {
            var frag = this.splitNotificationText( value );
            this.notificationContent( frag );
        },


        /**
         * Splits the notification text into words and returns a dom fragment containing the words in spans
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

        notificationContent: function( fragment ) {
            if ( !fragment ) {
                console.log( 'Error:', 'notification fragment not supplied' );
                return;
            }

            var list = this.$.notification.querySelectorAll( 'span' );
            Array.prototype.forEach.call( list, function( el ) {
                this.$.notification.removeChild( el );
            }.bind( this ) );

            function span( text ) {
                var s = document.createElement( 'span' );
                s.innerHTML = text;
                return s;
            }


            this.$.notification.appendChild( fragment );

            // TODO: shoudlnt just call attached, this change needs
            // to be done in the notification element to
            // allow a content refresh
            this.$.notification.attached();

        }

    });

})();
