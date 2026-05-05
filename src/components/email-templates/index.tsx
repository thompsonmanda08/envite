type WelcomeProps = { name: string };
export function WelcomeEmail({ name }: WelcomeProps) {
  return (
    <div>
      <h1>Welcome to e-nvite, {name}</h1>
      <p>Start planning beautiful events and tracking RSVPs in one place.</p>
    </div>
  );
}

type InvitationProps = {
  guestName: string;
  eventName: string;
  hostName: string;
  eventDate: string;
  inviteUrl: string;
};
export function InvitationEmail({
  guestName,
  eventName,
  hostName,
  eventDate,
  inviteUrl,
}: InvitationProps) {
  return (
    <div>
      <h1>You're invited, {guestName}!</h1>
      <p>
        {hostName} has invited you to <strong>{eventName}</strong> on{" "}
        {eventDate}.
      </p>
      <p>
        <a href={inviteUrl}>View invitation &amp; RSVP</a>
      </p>
    </div>
  );
}

type ResetProps = { name: string; resetUrl: string; expiresIn: string };
export function PasswordResetEmail({ name, resetUrl, expiresIn }: ResetProps) {
  return (
    <div>
      <h1>Password reset</h1>
      <p>Hi {name},</p>
      <p>
        <a href={resetUrl}>Reset your password</a>
      </p>
      <p>Link expires in {expiresIn}.</p>
    </div>
  );
}
