compressor = require('node-minify')

if process.argv.length > 2
    opt = process.argv[2]
    console.log "Options: #{process.argv[2]}"

if opt isnt '--debug' and opt isnt '--trace'
    console.log "Minifying JS..."
    
    c = new compressor.minify {
        type: 'no-compress',
        buffer: 1000 * 1024,
        tempPath: 'tmp',
        fileIn: [
            'app/www/js/lib/jquery.min.js', 
            'app/www/js/lib/underscore-min.js', 
            'app/www/js/lib/backbone-min.js', 
            'app/www/js/lib/handlebars.js', 
            'app/www/js/lib/inc.js',
        ],
        fileOut: 'app/www/js/lib.js',
        callback: (err) -> 
            if err
                console.log(err)
            else
                console.log 'Created lib.js'
    }    
    
    c = new compressor.minify {
        type: 'uglifyjs',
        buffer: 1000 * 1024,
        tempPath: 'tmp',
        fileIn: [
            'app/www/js/init.js', 
            'app/www/js/models/models.js', 
            'app/www/js/lightbox_me.js', 
            'app/www/js/layout.js', 
            'app/www/js/layouthelper.js', 
            'app/www/js/views/baseview.js',
            'app/www/js/views/newpostview.js', 
            'app/www/js/views/postlistview.js', 
            'app/www/js/views/postlistviewitem.js',
            'app/www/js/views/postsview.js',
            'app/www/js/views/taglistview.js',
            'app/www/js/views/taglistviewitem.js',
            'app/www/js/views/userlistview.js',
            'app/www/js/views/postview.js',
            'app/www/js/views/userview.js',
            'app/www/js/views/edituserview.js',
            'app/www/js/views/loginview.js',
            'app/www/js/views/facebooksharepostview.js',
            'app/www/js/notifications.js',
            'app/www/js/main.js',
            'app/www/js/vintage.js'
        ],
        fileOut: 'app/www/js/poe3.js',
        callback: (err) -> 
            if err
                console.log(err)
            else
                console.log 'Created poe3.js'
    }    
else
    console.log "Skipped minify in debug mode."            


