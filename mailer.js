const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email via email providers
 * @param {string} to email of receipient
 * @param {string} subject subject of email
 * @param {string} filename filename of attachment
 * @param {string} filecontent base64 encoded string of data
 * @param {string} text plain text of the email
 * @param {string} html html of the email
 */
const sendEmail = (
  to,
  subject,
  filename,
  filecontent,
  text = 'Your Grab receipts summary',
  html = 'Your Grab receipts summary'
) =>
  sgMail
    .send({
      to,
      from: {
        name: 'Malcolm Kee',
        email: 'malcolm.keeweesiong@gmail.com'
      },
      subject,
      text,
      html,
      attachments: [
        {
          filename,
          content: filecontent,
          type: 'plain/text'
        }
      ]
    })
    .catch(err => {
      console.error(err.toString());
      console.log({ message: err.message, code: err.code });
    });

module.exports = {
  sendEmail
};
