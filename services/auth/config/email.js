import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name using ESM approach
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read the HTML template file
const htmlTemplate = fs.readFileSync(path.join(__dirname, 'email.html'), 'utf8')

const send_mail = async (to_email, code) => {

    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     host: 'smtp.gmail.com',
    //     port: 465,
    //     secure: true,
    //     auth: {
    //         user: process.env.EMAIL_HOST_USER,
    //         pass: process.env.EMAIL_HOST_PASSWORD
    //     }
    // })
    const transporter = nodemailer.createTransport({
        host: 'mailserver',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_HOST_USER,
            pass: process.env.EMAIL_HOST_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
      })
    let htmlContent = htmlTemplate.replace(/\${code}/g, code)
    htmlContent = htmlContent.replace(/\${email}/g, encodeURIComponent(to_email))
    
    const details = {
        from: process.env.EMAIL_HOST_USER,
        to: to_email,
        subject: `Welcome Back to BlackHoleJS! Your Verification Code Was Sent`,
        // text: `Enter this recovery code to continue: ${code}`,
        html: htmlContent
    }
    
    try {
        await transporter.sendMail(details)
        console.log(`Email sent to ${to_email}`)
    } catch (error) {
        console.error('Error sending email:', error)
        throw error
    }
}

export default send_mail