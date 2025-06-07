const form = document.getElementById('login-form') as HTMLFormElement;
const output = document.getElementById('output') as HTMLElement;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement)
    .value;

  const resp = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await resp.json();
  output.textContent = JSON.stringify(data, null, 2);

  if (data.token) {
    const usersResp = await fetch('/users', {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    const users = await usersResp.json();
    output.textContent += '\n' + JSON.stringify(users, null, 2);
  }
});
