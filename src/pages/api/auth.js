import { Mailchain } from "@mailchain/sdk";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mailchain = Mailchain.fromSecretRecoveryPhrase(
  process.env.MAILCHAIN_SECRET_RECOVERY_PHRASE
);

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return;

  const { email } = req.body;
  const { data: magicLinkData, error: magicLinkError } =
    await adminSupabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
  if (magicLinkError) {
    return res
      .status(500)
      .send({ msg: "Failed Supabase generateLink", error: magicLinkError });
  }
  const { data: sendMailData, error: sendMailError } = await mailchain.sendMail(
    {
      from: (await mailchain.user()).address,
      to: [email],
      subject: 'Supabase Magic Link',
      content: {
        text: `To authenticate, navigate to: ${magicLinkData.properties.action_link}`,
        html: `Click <a href="${magicLinkData.properties.action_link}">here</a> to authenticate.`,
      },
    },
    { saveToSentFolder: false },
  );
  if (sendMailError) {
    return res.status(500).send({ msg: 'Failed Mailchain sendMail', error: sendMailError });
  }
  return res.status(200).send();
}
