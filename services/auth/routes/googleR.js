import googleC from '../controllers/googleC.js'
import {OAuth2Client} from 'google-auth-library'


const oauth2google = (fastify, options, done) => {

    // fastify.register(import ('@fastify/jwt'),
    // {secret: process.env.JWT_SECRET,
    // sign: {expiresIn:'4h'}})

    const oauthGoogleSchema = {
        schema:
        {
            querystring:
            {
                type: 'object',
                required: ['code'],
                properties: { code: {type:'string'} }
            },
            response:
            {
                '200':
                {
                    type : 'object',
                    properties: { Success: {type: 'string'}, token: {type : 'string'} }
                },
                '4xx':
                {
                    type:'object',
                    properties:
                    {
                        Success:{type:'string'},
                        Error:{type:'string'}
                    }
                }
            }
        },
        handler: googleC(fastify)
    }

    fastify.get('/oauth/google/', oauthGoogleSchema) 

    fastify.get('/google/',(_, res) => {

        const oauth2C = new OAuth2Client({
            clientId: process.env.CLIENT_ID_GOOGLE,
            clientSecret: process.env.CLIENT_SECRET_GOOGLE,
            redirectUri: process.env.GOOGLE_REDIRECT
        })

        const authURL = oauth2C.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email']
        })
        
        //https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&response_type=code&client_id=373713270678-0dro9nrh86tlpcse6a4bia0ssf296o8m.apps.googleusercontent.com&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Foauth%2Fgoogle%2F
        res.redirect(authURL)
    })

    done()
}

export default oauth2google