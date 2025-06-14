document.addEventListener('DOMContentLoaded', () => {
  // Registration form handler
  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) {
    registrationForm.addEventListener('submit', showModal);
  }

  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

// REGISTRATION HANDLER
function showModal(event) {
  event.preventDefault();

  const name = document.querySelector('input[name="name"]').value.trim();
  const surname = document.querySelector('input[name="surname"]').value.trim();
  const age = document.querySelector('input[name="age"]').value.trim();
  const gender = document.querySelector('select[name="gender"]').value;
  const phone = document.querySelector('input[name="phone"]').value.trim();
  const email = document.querySelector('input[name="email"]').value.trim();
  const country = document.querySelector('input[name="country"]').value.trim();
  const marital_status = document.querySelector('select[name="marital_status"]').value;
  const next_of_kin = document.querySelector('input[name="next_of_kin"]').value.trim();
  const password = document.querySelector('input[name="password"]').value.trim();
  const confirmPassword = document.querySelector('input[name="confirm_password"]').value.trim();

  if (!name || !surname || !age || !gender || !phone || !email || !country || !marital_status || !next_of_kin || !password || !confirmPassword) {
    alert("Please fill out all fields.");
    return;
  }

  if (isNaN(age) || age <= 0 || age > 120) {
    alert("Please enter a valid age between 1 and 120.");
    return;
  }

  if (!/^\d{8}$/.test(phone)) {
    alert("Phone number must be exactly 8 digits.");
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  const submitBtn = document.getElementById('submit-button');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Submitting...';

  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name, surname, age, gender, phone, email, country, marital_status, next_of_kin, password
    })
  })
  .then(async response => {
    const result = await response.json();
    if (response.ok && result.message === 'Registration successful') {
      document.getElementById('success-modal').style.display = 'flex';
      registrationForm.reset();
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        window.location.href = '/Home-Page/index.html';
      }, 2000);
    } 
    
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Submit';
  });
}

// LOGIN HANDLER
function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value.trim();

  // Client-side validation
  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  // Relaxed email validation to accept all valid emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // Attempt login
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  })
  .then(async response => {
    const data = await response.json();

    if (!response.ok) {
      // Server responded with error
      alert(data.message || 'Invalid login credentials.');
      return;
    }

    // Login successful
    if (data.message === 'Login successful') {
      console.log('Login response data:', data);
      localStorage.setItem('loggedInUserName', data.name);
      localStorage.setItem('loggedInUserSurname', data.surname || '');
      console.log('Stored loggedInUserName:', localStorage.getItem('loggedInUserName'));
      console.log('Stored loggedInUserSurname:', localStorage.getItem('loggedInUserSurname'));
      document.getElementById("success-modal").style.display = "flex";

    }
  })
  .catch(error => {
    console.error('Login error:', error);
    alert('Server error. Please try again later.');
  });
}

// Logout button event
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      // Clear localStorage keys related to user
      localStorage.removeItem('loggedInUserName');
      localStorage.removeItem('loggedInUserSurname');

      // Clear all cookies by setting expiry date in the past
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
      });

      // Send logout request to server
      await fetch("/logout", { method: "POST" });

      // Redirect to index.html (home page)
      window.location.href = "../Home-Page/index.html";
    });
  }
});

// JavaScript to dynamically set the username in the account dropdown from backend profile API
document.addEventListener('DOMContentLoaded', () => {
  const usernameDisplay = document.getElementById('usernameDisplay');
  fetch('http://localhost:3000/user/profile', {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    return response.json();
  })
  .then(data => {
    if (usernameDisplay) {
      const fullName = data.surname ? data.name + ' ' + data.surname : data.name;
      usernameDisplay.textContent = fullName;
    }
  })
  .catch(error => {
    console.error('Error fetching user profile:', error);
    if (usernameDisplay) {
      // Fallback to localStorage username if available
      const storedName = localStorage.getItem('loggedInUserName');
      const storedSurname = localStorage.getItem('loggedInUserSurname');
      if (storedName) {
        usernameDisplay.textContent = storedSurname ? storedName + ' ' + storedSurname : storedName;
      } else {
        usernameDisplay.textContent = 'Guest';
      }
    }
  });
});

// Cart count update function
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartCountSpan = document.querySelector('a[aria-label="Shopping Cart"] span');
  if (cartCountSpan) {
    cartCountSpan.textContent = count;
  }
}

// Update cart count on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
});

// Update cart count when page becomes visible (e.g., when switching tabs)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    updateCartCount();
  }
});
