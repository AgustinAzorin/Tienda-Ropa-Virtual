'use server';

export async function retrieveOrderFromMedusa(medusaOrderId: string) {
  return {
    order: {
      id: medusaOrderId,
      status: 'pending',
    },
  };
}
