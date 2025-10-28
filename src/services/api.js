// Simple API service wrapper using fetch
// Usage:
//  import api from '../services/api';
//  api.setToken(token);
//  const data = await api.get('/api/users/');

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

let _token = localStorage.getItem('token') || null;

export function setToken(token) {
  _token = token;
  try { localStorage.setItem('token', token); } catch (e) { /* ignore in some environments */ }
}

export function clearToken() {
  _token = null;
  try { localStorage.removeItem('token'); } catch (e) { /* ignore */ }
}

async function parseResponse(res) {
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) {
    const err = new Error((data && data.message) || res.statusText || 'API error');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function buildUrl(path) {
  if (!path) path = '';
  // allow passing absolute URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // ensure single slash between base and path
  return API_BASE.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const url = buildUrl(path);
  const opts = { method, headers: { ...headers }, mode: 'cors' };
  if (_token) opts.headers['Authorization'] = `Bearer ${_token}`;

  if (body !== undefined && !(body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    // let browser set Content-Type with boundary
    opts.body = body;
  }

  try {
    // Helpful debug info when developing
    // console.debug('API request', method, url, opts);
    const res = await fetch(url, opts);
    return await parseResponse(res);
  } catch (err) {
    // Network or CORS error (fetch throws TypeError: Failed to fetch)
    const e = new Error(`Network error when fetching ${method} ${url}: ${err.message}`);
    e.cause = err;
    // Attach some context for easier debugging in the UI
    e.request = { url, method, opts };
    throw e;
  }
}

export function get(path) { return request(path, { method: 'GET' }); }
export function post(path, data) { return request(path, { method: 'POST', body: data }); }
export function put(path, data) { return request(path, { method: 'PUT', body: data }); }
export function del(path) { return request(path, { method: 'DELETE' }); }

// helper for multipart/form-data uploads
export async function postForm(path, formData) {
  return request(path, { method: 'POST', body: formData });
}

const api = { setToken, clearToken, get, post, put, del, postForm };
export default api;
