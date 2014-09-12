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
            console.log( 'setting:', value );

            // If the bar is showing, then hide, update and show
            if ( this.$.notification._showing ) {
                this.$.notification.hide();
                this.$.notification.addEventListener( 'hideEnd', function( event ) {
                    this._notificationText = value;
                    this.$.notification.show();
                }.bind( this ) );
                return;
            }

            //  If we got here then the bar is currently hidden so just update the text
            this._notificationText = value;
        }

    });

})();
