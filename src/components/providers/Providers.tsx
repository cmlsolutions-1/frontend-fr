import { PayPalScriptProvider } from '@paypal/react-paypal-js';


interface Props {
  children: React.ReactNode;
}

export const Providers = ({ children }: Props) => {


  return (
    <PayPalScriptProvider options={{ 
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
      intent: 'capture',
      currency: 'USD',
    }}>
      
    </PayPalScriptProvider>
  );
};
