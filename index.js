
var app = require( './lib/server' );

app.listen( process.env.PORT || 8008 );
console.log( 'Listening on port', process.env.PORT || '8008' );
