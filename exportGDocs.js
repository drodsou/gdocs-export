

// ------------------------------------------------------------ GOOGLE BOILERPLATE
// As explained in: https://developers.google.com/drive/v3/web/quickstart/nodejs

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly', 
  'https://www.googleapis.com/auth/drive' // Necessary to 'export'  files
]

//var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_DIR = 'private/'
var TOKEN_PATH = TOKEN_DIR + 'credentials.json'   // Delete this file to reset authorizatio processs

// Load client secrets from a local file.
fs.readFile('private/client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Drive API.
  authorize(JSON.parse(content), authOK);     // <-- final auth callback
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}




// -------------------------------------------------------------------- CONNECTED

// CB helper for await
function cbDone (...args) { cbDone.next(args) }
cbDone.then = resolve=>cbDone.next=resolve


function authOK(auth) {
	var gdriveAPI = google.drive('v3');		// API: google.drive  (require googleapis)
	//console.log("API",gdriveAPI.files)	// show api


  /**
   * List them
   */
	async function listAllGoogleDocFiles() {
    var pageToken

    do {

        //console.log('---')

        gdriveAPI.files.list({
            auth: auth,
            pageSize: 1000,
            q: "mimeType = 'application/vnd.google-apps.document'",   // See: https://developers.google.com/drive/v3/web/mime-types
            fields: "nextPageToken, files(id, name)",
            pageToken
        }, cbDone)
        
        var [err,response] = await cbDone

        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }

        var files = response.files;
        if (files.length == 0) {
            console.log('No files found.');
            return
        }

        // files found
        //console.log('Files:');
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            console.log( `${file.name};${file.id}` )    // redirect to file >
        }
        
        pageToken = response.nextPageToken
        
    } while (pageToken /*&& ++numCalls <= 2*/)
	}
	

  /**
   * Export a google-doc to html
   */
  function export1Gdoc2Html(fileId, fileName, cb) {
		gdriveAPI.files.export({
		   auth : auth,
		   fileId: fileId,
       mimeType : 'text/html',
		   alt: 'media'
	   }, function(err, res) {
		   fs.writeFileSync('private/gdocs/' + fileName + '.html', res, 'utf8')

       cb()
	   })
	}

  
  /**
   * 
   */

  async function exportAllGdocs() {
      var files = fs.readFileSync('private/allGoogleDocs.csv', 'utf8').split('\n').map(e=>e.split(';'))
      for (let f=0; f<files.length; f++) {
          export1Gdoc2Html( files[f][0], files[f][1], cbDone)
          var res = await cbDone
          console.log('Done:', files[f][0])
      }
  }

	
	
	// --- GO
  export1Gdoc2Html('1FQ3GTLgN1zMxE3wdjoHI-IXk5BicMmUx9ykJLXchBHs', 'marus',x=>x)

	//listAllGoogleDocFiles();	
  //exportAllGdocs()

} // AuthOK