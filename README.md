# Google Docs exporter:

* List all google doc files of your google drive account:
  * exportGDocs.js > listAllGoogleDocFiles()
* Exports them to html (after creating a file with the function above):
  * exportGDocs.js > exportAllGdocs()

* Also converts a directory of html files to markdown files
  * html2md.js

# Explanation
Google Apis connection boilerplate explained here:

https://developers.google.com/drive/v3/web/quickstart/nodejs

except that "private" directory is used for both client_secret.json and credentials

Credentials file has been moved to 'private/credentials.json'

if that file doesnt exist, cli/web authorization process is triggered

