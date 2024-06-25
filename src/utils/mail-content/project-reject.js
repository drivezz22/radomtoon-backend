module.exports.projectReject = (reason) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Project Rejected</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 0 20px;
      }
      .header {
        text-align: start;
        font-size: 16px;
      }
      .content {
        text-align: left;
      }
      .content h2 {
        text-indent: 16px;
      }
      .content p {
        font-size: 14px;
      }
      .body-content {
        padding: 5px 0;
      }
      .to {
        padding-top: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <p>Project Rejected</p>
      </div>
      <div class="content">
        <p class="to">Hi, Creator!</p>
        <div class="body-content">
        <p>
            We regret to inform you that your project on the RADOMTOON platform has been
            rejected. After careful consideration, we have determined that it does not
            meet our guidelines at this time due to the following reason: ${reason}.
        </p>
        <p>
            We encourage you to review our submission guidelines and make any necessary
            adjustments to your project. You are welcome to resubmit your project for
            consideration in the future.
        </p>
        <p>
            If you have any questions or need further assistance, please do not hesitate
            to contact our support team.
        </p>
        </div>
        <p>Best regards,</p>
        <p>RADOMTOON Team</p>
      </div>
    </div>
  </body>
</html>`;
