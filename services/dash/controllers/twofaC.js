import twofaS from "../services/twofaS.js"

const twofaC = async (req, res) => {
    try
    {
        const {activate} = req.query
        
        const isOTPon = await twofaS(req.user.id, activate)
        if (isOTPon)
            return res.status(200).send(isOTPon)
        res.status(200)
    }
    catch(err)
    {
        res.status(400).send({Error:err.message})
    }
}

export default twofaC