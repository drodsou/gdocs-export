var fs=require('fs')
var toMd = require('to-markdown')

var upndown = require('upndown');
var und = new upndown()


// CB helper
function cbDone (...args) { cbDone.next(args) }
cbDone.then = resolve=>cbDone.next=resolve


var files = fs.readdirSync("private/gdocs")


async function markdownize(files) {
  var fileBody, fileContent
  for (let f=0; f<files.length; f++) {
    fileContent = fs.readFileSync('private/gdocs/' + files[f], 'utf8')
    fileBody = /<body.*?>([\s\S]*)<\/body>/.exec(fileContent)[1];

    und.convert(fileBody, cbDone)
    var [err,markdown] = await cbDone
    if (err) { console.err('---', files[f], err) }
    else { 
      var mdFileName = 'private/md/' + files[f].replace('.html','.md')
      fs.writeFileSync(mdFileName, markdown, 'utf8')
      console.log('Done:', mdFileName)
    } // Outputs: # Hello, World !

    //if (f==1) break;
  }
}

markdownize(files)












