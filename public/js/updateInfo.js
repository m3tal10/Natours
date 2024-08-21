/* eslint-disable */
import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';
import { logOut } from './login';

export const updateMe = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:8000/api/v1/users/changePassword'
        : 'http://localhost:8000/api/v1/users/user';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Updated Successfully.');
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
