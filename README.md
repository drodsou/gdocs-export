# Google Docs exporter:

* List all google docs types of your google drive account
  * exportGDocs.js > listAllGoogleDocFiles()
* Exports them to html
  * exportGDocs.js > exportAllGdocs()

* Also converts a directory of html files to markdown files
  * html2md.js

# Explanation
Connection boilerplate explained here:
As explained in: https://developers.google.com/drive/v3/web/quickstart/nodejs

except that "private" directory is used for both client_secret.json

also credentials file has been moved to 'private/credentials.json'
if that file doesnt exist, cli/web authorization process is triggered