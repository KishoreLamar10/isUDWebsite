import { sendMail } from '@/lib/mailer';

type ProjectSubmissionEmailInput = {
  approvalUrl: string;
  projectName: string;
  projectNumber?: number | null;
  submittedTo: string;
};

const defaultApprovalEmail = 'balakishore619@gmail.com';

export function getProjectApprovalEmail() {
  return process.env.PROJECT_APPROVAL_EMAIL || defaultApprovalEmail;
}

export async function sendProjectSubmissionEmail({
  approvalUrl,
  projectName,
  projectNumber,
  submittedTo,
}: ProjectSubmissionEmailInput) {
  const projectLabel = projectNumber ? `#${projectNumber} - ${projectName}` : projectName;

  await sendMail({
    to: submittedTo,
    subject: `isUD project approval requested: ${projectLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h1 style="font-size: 20px;">Project submitted for approval</h1>
        <p><strong>${projectLabel}</strong> is ready for certification review.</p>
        <p>Approve this project to mark it as Certified.</p>
        <p>
          <a href="${approvalUrl}" style="display: inline-block; background: #002a54; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Approve project
          </a>
        </p>
        <p style="font-size: 12px; color: #64748b;">If the button does not work, open this link: ${approvalUrl}</p>
      </div>
    `,
    text: `Project submitted for approval: ${projectLabel}\n\nApprove it here: ${approvalUrl}`,
  });

  return { delivered: true };
}
