/* eslint-disable */
import { login, logOut } from './login';
import { updateMe } from './updateInfo';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { signup } from './signup';

//DOM elements
const mapBox = document.getElementById('map');
const form = document.getElementById('login');
const signupBtn = document.getElementById('signupbtn');
const logOutButton = document.querySelector('.nav__el--logout');
const updateUserInfoBtn = document.querySelector('.save--info');
const updateUserPassword = document.querySelector('.update--password');
const bookBtn = document.getElementById('book-tour');
//VALUES

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations,
  );
  displayMap(locations);
}

//Logging in if the login button is clicked
if (form) {
  document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

//Signing up users
if (signupBtn) {
  signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupBtn.disabled = true;
    e.target.textContent = 'Processing...';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordconfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

//Logging out if the logout button was clicked
if (logOutButton) logOutButton.addEventListener('click', logOut);

//Updating user information if the Save settings button is clicked
if (updateUserInfoBtn) {
  updateUserInfoBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('myname').value);
    form.append('email', document.getElementById('myemail').value);
    form.append('photo', document.getElementById('photo').files[0]);

    await updateMe(form, 'data');
  });
}

if (updateUserPassword) {
  updateUserPassword.addEventListener('click', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password-current').value;
    const changePassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateMe(
      {
        password,
        changePassword,
        passwordConfirm,
      },
      'password',
    );
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    bookBtn.disabled = true;
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
