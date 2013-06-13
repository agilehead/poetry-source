https = require 'https'

conf = require '../../conf'
models = new (require '../../models').Models(conf.db)
controller = require('./controller')
utils = require '../../common/utils'
AppError = require('../../common/apperror').AppError

OAuth = require('oauth').OAuth
oa = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	conf.auth.twitter.TWITTER_CONSUMER_KEY,
	conf.auth.twitter.TWITTER_SECRET,
	"1.0A",
	conf.auth.twitter.TWITTER_CALLBACK,	
	"HMAC-SHA1"
)


class AuthController extends controller.Controller
    
    twitter: (req, res, text) =>
        oa.getOAuthRequestToken (error, oauth_token, oauth_token_secret, results) =>
            if error
                console.log error
                res.send "Error in authenticating"
            else
                oauthProcessKey = utils.uniqueId(24)
                oauth = { token: oauth_token, token_secret: oauth_token_secret }

                token = new models.Token {
                    type: 'oauth-process-key',
                    key: oauthProcessKey,
                    value: oauth
                }        
    
                token.save { user: req.user }, (err, token) =>
                    if not err
                        res.cookie 'oauth_process_key', oauthProcessKey
                        res.send "
                            <html>
                                <script type=\"text/javascript\">
                                    window.location.href = \"https://twitter.com/oauth/authenticate?oauth_token=#{oauth_token}\";
                                </script>
                                <body></body>
                            </html>"
                    else
                        next err
            

    
    twitterCallback: (req, res, next) =>
        models.Token.get { type: 'oauth-process-key', key: req.cookies.oauth_process_key }, {}, (err, token) =>            
            if not err
                if token
                    oauth = token.value
                    oauth.verifier = req.query.oauth_verifier
                    oa.getOAuthAccessToken oauth.token, oauth.token_secret, oauth.verifier, (error, accessToken, accessTokenSecret, results) =>
                        if error
	                        console.log error
	                        res.send "Could not connect to Twitter."
                        else
                            console.log "Twitter: authenticated #{results.screen_name}"
                            
                            oa.get "https://api.twitter.com/1.1/users/lookup.json?screen_name=#{results.screen_name}",
                                accessToken,
                                accessTokenSecret,
                                (e, data, _res) =>
                                    data = JSON.parse data
                                    if data.length and data[0]?
                                        userDetails = @parseTwitterUserDetails data[0]
                                        models.User.getOrCreateUser userDetails, 'tw', accessToken, (err, _user, _session) =>
                                            res.clearCookie "oauth_process_key"
                                            res.cookie "userid", _user._id.toString()
                                            res.cookie "domain", "tw"
                                            res.cookie "username", _user.username
                                            res.cookie "fullName", _user.name
                                            res.cookie "passkey", _session.passkey
                                            res.send '
                                                <html>
                                                    <script type="text/javascript">
                                                        window.location.href = "/";
                                                    </script>
                                                    <body></body>
                                                </html>'
                                                        
                                    else
                                        console.log JSON.stringify data
                                        res.send "Invalid response."                            
                else
                    console.log "No token"
                    res.send "Could not connect to Twitter."
            else
                next err                
                


    parseTwitterUserDetails: (userDetails) =>
        {
            domainid: userDetails.id ? '',
            username: userDetails.screen_name,
            name: userDetails.name ? userDetails.screen_name,
            location: userDetails.location ? '',
            email: "twitteruser@poe3.com",
            picture: userDetails.profile_image_url,
            thumbnail: userDetails.profile_image_url
        }                
            

exports.AuthController = AuthController
