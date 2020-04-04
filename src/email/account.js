const sendEmail = require('@sendgrid/mail')

sendEmail.setApiKey(process.env.SEND_GRID_KEY)

const sendEmailToUserBeforCreateAcc = (email, name) => {
    sendEmail.send({
        to: email,
        from: 'daoadung@gmail.com',
        subject: `Hello ${name}. Welcom to our App`,
        text : `Thank you ${name} used and join to our app`
    })
}

const sendEmailToUserProRemoveAcc = (email, name) => {
    sendEmail.send({
        to: email,
        from: 'daoadung@gmail.com',
        subject: `Hello ${name}. It's verry Terrible`,
        text : `Why would ${name} want to remove the acc in our App`
    })
}

module.exports = {
    sendEmailToUserBeforCreateAcc, 
    sendEmailToUserProRemoveAcc
}

