import { signIn, getUser, signOut } from './auth.js';
import { getUserFragments, createFragment } from './api.js';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const user = await getUser();
  if (user) {
    userSection.innerHTML = `
      <p>Welcome, ${user.username}!</p>
      <button id="logout">Logout</button>
      <div id="create-fragment">
        <h3>Create fragment</h3>
        <textarea id="fragment-content" rows="4" cols="40"></textarea>
        <br />
        <button id="create">Create</button>
        <div id="create-result"></div>
      </div>
    `;
    const logoutBtn = document.querySelector('#logout');
    logoutBtn.addEventListener('click', async () => {
      await signOut();
    });
    try {
      const fragments = await getUserFragments(user);
      console.log('User fragments:', fragments);
      const list = document.createElement('ul');
      list.id = 'fragments-list';
      (fragments.fragments || []).forEach((f) => {
        const li = document.createElement('li');
        li.textContent = `${f.id} — ${f.type}`;
        list.appendChild(li);
      });
      userSection.appendChild(list);
    } catch (error) {
      console.error('Failed to get fragments:', error);
    }
    const createBtn = document.querySelector('#create');
    createBtn.addEventListener('click', async () => {
      const content = document.querySelector('#fragment-content').value;
      try {
        const result = await createFragment(user, content, 'text/plain');
        document.querySelector(
          '#create-result'
        ).textContent = `Created: ${result.fragment.id}`;
        // add to list
        const list = document.querySelector('#fragments-list');
        if (list) {
          const li = document.createElement('li');
          li.textContent = `${result.fragment.id} — ${result.fragment.type}`;
          list.appendChild(li);
        }
      } catch (err) {
        document.querySelector(
          '#create-result'
        ).textContent = `Error: ${err.message}`;
      }
    });
  } else {
    loginBtn.addEventListener('click', signIn);
  }
}

addEventListener('DOMContentLoaded', init);
