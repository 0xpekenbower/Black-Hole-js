import dp from "../services/profilesS.js"

function passValidator (password) {
    let errors = []
    if (password.length < 10)
        errors.push('Password must contain at least 10 characters')
    if (!/[a-z]/.test(password))
        errors.push('Password must contain [a-z]')
    if (!/[A-Z]/.test(password))
        errors.push('Password must contain [A-Z]')
    if (!/[0-9]/.test(password))
        errors.push('Password must contain [0-9]')
    if (!/[@$!%*?&'"]/.test(password))
        errors.push('Password must contain [@$!%*?&\'"]')
    return errors
}

export default {
    async profilesC (req, res) {
        try
        {
            let data;
            if (req.query['id'])
                data = await dp.display_profile(req.query['id'], req.user.id)
            else
                data = await dp.display_profile(req.user.id, req.user.id)

            res.status(200).send(data)
        }
        catch(err)
        {
            // res.status(400).send({ Error:err.message })
            res.status(400).send({ error: err})
        }
    },

    async searchC(req, res){
        try
        {
            const data = await dp.searchS(req.query['q'])
            res.status(200).send(data)
        }
        catch(err)
        {
            res.status(400).send({ Error:err.message })
        }
    },
    
    async changePassC(req, res){
        try
        {
            const {old_pass, new_pass, re_pass} = req.body
            if (new_pass != re_pass)
                throw new Error('Passwords does not match')
            
            if (old_pass == new_pass)
                throw new Error('The new password is the same as the old')
            const errs = passValidator(new_pass)
            if (errs.length)
                throw new Error(errs)
            
            await dp.changePassS(req.headers.authorization, old_pass, new_pass)
            res.status(204)
        }
        catch(err)
        {
            if (err.status)
                return res.status(401).send({Error: 'Incorrect password'})
            res.status(400).send({ Error: err.message })
        }
    },

    async editC(req, res){

        try
        {
            const {first_name, last_name, bio, avatar, background} = req.body
            if (!first_name && !last_name && !bio && !avatar && !background)
                throw new Error('No field is defined')

            await dp.editS(req.user.id, first_name, last_name, bio, avatar, background)

            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({ Error: err.message })
        }
    }
}
