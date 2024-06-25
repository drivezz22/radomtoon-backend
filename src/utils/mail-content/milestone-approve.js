module.exports.milestoneApproval = (milestoneRank) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Milestone ${milestoneRank} Approved</title>
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
        <p>Milestone ${milestoneRank} Approved</p>
      </div>
      <div class="content">
        <p class="to">Hi, Creator!</p>
        <div class="body-content">
            <p>
            We are pleased to inform you that the evidence for your project on the RADOMTOON platform has been approved. You can now proceed to the next step and continue working on your project.
            </p>
            <p>
            Thank you for your hard work and dedication. We are excited to see the progress you will make in the upcoming phases of your project.
            </p>
            <p>
            If you have any questions or need further assistance, please feel free to reach out to our support team.
            </p>
        </div>
        <p>Best regards,</p>
        <p>RADOMTOON Team</p>
      </div>
    </div>
  </body>
</html>`;
