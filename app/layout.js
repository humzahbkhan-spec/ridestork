export const metadata = {
  title: "RideStork – Split Rides with Students",
  description: "Find students heading your way. Split rides, save money, travel together.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
