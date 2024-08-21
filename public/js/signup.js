import axios from 'axios';
import { showAlert } from './alert';
import { login } from './login';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      await login(email, password);
      showAlert('success', 'Account created successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
