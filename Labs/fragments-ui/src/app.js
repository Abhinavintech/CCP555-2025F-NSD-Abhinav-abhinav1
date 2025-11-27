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
        <h3>Create Fragment</h3>
        <label for="fragment-type">Content Type:</label>
        <select id="fragment-type">
          <option value="text/plain">Plain Text</option>
          <option value="text/markdown">Markdown</option>
          <option value="text/html">HTML</option>
          <option value="application/json">JSON</option>
          <option value="text/csv">CSV</option>
        </select>
        <br><br>
        <label for="fragment-content">Content:</label><br>
        <textarea id="fragment-content" rows="6" cols="60" placeholder="Enter your fragment content here..."></textarea>
        <br><br>
        <button id="create">Create Fragment</button>
        <div id="create-result"></div>
      </div>
      <div id="fragments-section">
        <h3>Your Fragments</h3>
        <button id="refresh-fragments">Refresh List</button>
        <div id="fragments-list"></div>
      </div>
    `;
    const logoutBtn = document.querySelector('#logout');
    logoutBtn.addEventListener('click', async () => {
      await signOut();
    });
    // Load fragments function
    async function loadFragments() {
      try {
        const fragments = await getUserFragments(user, true); // expanded=true
        console.log('User fragments:', fragments);
        const fragmentsDiv = document.querySelector('#fragments-list');
        if (fragments.fragments && fragments.fragments.length > 0) {
          fragmentsDiv.innerHTML = fragments.fragments.map(f => `
            <div class="fragment-item" style="border: 1px solid #ccc; margin: 10px 0; padding: 10px;">
              <strong>ID:</strong> ${f.id}<br>
              <strong>Type:</strong> ${f.type}<br>
              <strong>Size:</strong> ${f.size} bytes<br>
              <strong>Created:</strong> ${new Date(f.created).toLocaleString()}<br>
              <strong>Updated:</strong> ${new Date(f.updated).toLocaleString()}
            </div>
          `).join('');
        } else {
          fragmentsDiv.innerHTML = '<p>No fragments found.</p>';
        }
      } catch (error) {
        console.error('Failed to get fragments:', error);
        document.querySelector('#fragments-list').innerHTML = '<p>Error loading fragments.</p>';
      }
    }
    
    // Initial load
    await loadFragments();
    // Refresh button
    const refreshBtn = document.querySelector('#refresh-fragments');
    refreshBtn.addEventListener('click', loadFragments);
    
    // Create fragment button
    const createBtn = document.querySelector('#create');
    createBtn.addEventListener('click', async () => {
      const content = document.querySelector('#fragment-content').value;
      const contentType = document.querySelector('#fragment-type').value;
      
      if (!content.trim()) {
        document.querySelector('#create-result').innerHTML = '<p style="color: red;">Please enter some content.</p>';
        return;
      }
      
      try {
        const result = await createFragment(user, content, contentType);
        document.querySelector('#create-result').innerHTML = `
          <p style="color: green;">✅ Fragment created successfully!</p>
          <p><strong>ID:</strong> ${result.fragment.id}</p>
          <p><strong>Type:</strong> ${result.fragment.type}</p>
          <p><strong>Size:</strong> ${result.fragment.size} bytes</p>
        `;
        
        // Clear the form
        document.querySelector('#fragment-content').value = '';
        
        // Refresh the fragments list
        await loadFragments();
      } catch (err) {
        document.querySelector('#create-result').innerHTML = `<p style="color: red;">❌ Error: ${err.message}</p>`;
      }
    });
  } else {
    loginBtn.addEventListener('click', signIn);
  }
}

addEventListener('DOMContentLoaded', init);
