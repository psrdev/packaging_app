import client from './client';
import { Order, OrderItem, PackingPhoto, PaginatedResponse } from '../types';

export const getOrders = async (page = 1, search = ''): Promise<PaginatedResponse<Order>> => {
  const params: Record<string, any> = { page };
  if (search) {
    params.search = search;
  }
  const response = await client.get('/packer/orders', { params });
  return response.data;
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await client.get(`/packer/orders/${id}`);
  return response.data;
};

export const startPacking = async (id: number): Promise<Order> => {
  const response = await client.post(`/packer/orders/${id}/start`);
  return response.data;
};

export const confirmItem = async (
  itemId: number,
  payload: { quantity: number; packer_note?: string | null }
): Promise<OrderItem> => {
  const response = await client.post(`/packer/order-items/${itemId}/confirm`, payload);
  return response.data;
};

export const uploadPhoto = async (
  orderId: number,
  photoUri: string,
  note?: string | null
): Promise<PackingPhoto> => {
  const formData = new FormData();
  
  const filename = photoUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  // React Native FormData requires { uri, name, type } object cast to any
  formData.append('photo', {
    uri: photoUri,
    name: filename,
    type,
  } as any);
  
  if (note) {
    formData.append('note', note);
  }
  
  const response = await client.post(`/packer/orders/${orderId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const completePacking = async (id: number): Promise<Order> => {
  const response = await client.post(`/packer/orders/${id}/complete`);
  return response.data;
};

export const flagOrderIssue = async (id: number, reason: string): Promise<Order> => {
  const response = await client.post(`/packer/orders/${id}/issue`, { reason });
  return response.data;
};
