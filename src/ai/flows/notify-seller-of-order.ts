'use server';

/**
 * @fileOverview Notifies the seller of a new order with a summary.
 *
 * - notifySellerOfOrder - A function that sends a notification to the seller.
 * - NotifySellerOfOrderInput - The input type for the notifySellerOfOrder function.
 * - NotifySellerOfOrderOutput - The return type for the notifySellerOfOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NotifySellerOfOrderInputSchema = z.object({
  orderId: z.string().describe('The ID of the order.'),
  customerName: z.string().describe('The name of the customer.'),
  customerEmail: z.string().email().describe('The email address of the customer.'),
  customerPhone: z.string().describe('The phone number of the customer.'),
  deliveryAddress: z.string().describe('The delivery address of the customer.'),
  orderSummary: z.string().describe('A summary of the order, including items and total price.'),
});
export type NotifySellerOfOrderInput = z.infer<typeof NotifySellerOfOrderInputSchema>;

const NotifySellerOfOrderOutputSchema = z.object({
  emailSent: z.boolean().describe('Whether the email notification was successfully sent.'),
  whatsAppSent: z.boolean().describe('Whether the WhatsApp notification was successfully sent.'),
});
export type NotifySellerOfOrderOutput = z.infer<typeof NotifySellerOfOrderOutputSchema>;

export async function notifySellerOfOrder(input: NotifySellerOfOrderInput): Promise<NotifySellerOfOrderOutput> {
  return notifySellerOfOrderFlow(input);
}

const notifySellerOfOrderPrompt = ai.definePrompt({
  name: 'notifySellerOfOrderPrompt',
  input: {schema: NotifySellerOfOrderInputSchema},
  output: {schema: NotifySellerOfOrderOutputSchema},
  prompt: `You are responsible for notifying the seller of a new order.

  Order Details:
  Order ID: {{{orderId}}}
  Customer Name: {{{customerName}}}
  Customer Email: {{{customerEmail}}}
  Customer Phone: {{{customerPhone}}}
  Delivery Address: {{{deliveryAddress}}}
  Order Summary: {{{orderSummary}}}

  Send an email notification to the seller and simulate a WhatsApp notification.
  Indicate in the output whether each notification was "sent" successfully by setting emailSent and whatsAppSent to true. Do not actually send the email or whatsapp message. Simply simulate it.
  `,
});

const notifySellerOfOrderFlow = ai.defineFlow(
  {
    name: 'notifySellerOfOrderFlow',
    inputSchema: NotifySellerOfOrderInputSchema,
    outputSchema: NotifySellerOfOrderOutputSchema,
  },
  async input => {
    const {output} = await notifySellerOfOrderPrompt(input);
    return output!;
  }
);
