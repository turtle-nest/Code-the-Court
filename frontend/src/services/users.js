// src/services/users.js
import { apiFetch } from '../utils/apiFetch';

export async function getAllUsers() {
  return apiFetch('/api/admin/users');
}

export async function approveUser(userId) {
  return apiFetch(`/api/admin/users/${userId}/approve`, {
    method: 'PATCH',
  });
}

export async function deleteUser(userId) {
  return apiFetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
}
