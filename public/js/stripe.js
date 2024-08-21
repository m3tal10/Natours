import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });
    location.assign(session.data.session.url);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
