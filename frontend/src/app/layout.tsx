import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppContextProvider from "@/context/AppContext";
import Script from "next/script";

export const metadata = {
  title: "Prescripto",
  description: "Doctor Appointment Booking System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        <AppContextProvider>
          <div className="mx-4 sm:mx-[10%]">
            <Navbar />
            <main className="min-h-[80vh]">{children}</main>
            <Footer />
          </div>
        </AppContextProvider>
      </body>
    </html>
  );
}
