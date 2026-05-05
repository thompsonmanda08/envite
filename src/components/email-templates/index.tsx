type WelcomeProps = { sellerName: string; shopName: string };
export function WelcomeEmail({ sellerName, shopName }: WelcomeProps) {
  return (
    <div>
      <h1>Welcome, {sellerName}</h1>
      <p>Your shop {shopName} is ready.</p>
    </div>
  );
}

type OrderItem = { name: string; quantity: number; image?: string };
type OrderProps = {
  customerName: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  orderDate: string;
  shippingAddress: string;
};
export function OrderConfirmationEmail({
  customerName,
  orderId,
  items,
  totalAmount,
  currency,
  orderDate,
  shippingAddress,
}: OrderProps) {
  return (
    <div>
      <h1>Order #{orderId}</h1>
      <p>Hi {customerName},</p>
      <p>Order placed {orderDate}</p>
      <ul>
        {items.map((it) => (
          <li key={it.name}>
            {it.name} x {it.quantity}
          </li>
        ))}
      </ul>
      <p>
        Total: {currency} {totalAmount}
      </p>
      <p>Ship to: {shippingAddress}</p>
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
