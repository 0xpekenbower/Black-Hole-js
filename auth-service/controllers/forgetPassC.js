import forgetPassS from '../services/forgetPassS.js'


export default {

    async send_mail(req, res) {
        try
        {
            const email = req.body['email']

            await forgetPassS.send_mailS(email)
            res.status(200).send({Success: true})
        }
        catch(err)
        {
            res.status(400).send({Error: err.message})
        }
    },

    async forget_passC(req, res) {
        try
        {
            const {email, code, password, repassword} = req.body
            if (password != repassword)
                throw new Error('Passwords does not match')

            await forgetPassS.forget_passS(email, code, password)
            res.status(200).send({Success: true})
        }
        catch(err)
        {
            res.status(400).send({Error: err.message})
        }
    },
}