<script lang="ts">
  import { Card, TextField, Button, Icon } from "m3-svelte";
  import iconSearch from "@ktibow/iconset-material-symbols/search";
  import iconSettings from "@ktibow/iconset-material-symbols/settings";
  import iconOpenInNew from "@ktibow/iconset-material-symbols/open-in-new";

  let {
    username = $bindable(""),
    repository = $bindable(""),
    loading = false,
    avatarUrl = "",
    onsubmit,
    onselectExample
  } = $props<{
    username: string;
    repository: string;
    loading: boolean;
    avatarUrl: string;
    onsubmit: () => void;
    onselectExample: (user: string, repo: string) => void;
  }>();

  let suggestions = $state<string[]>([]);
  let autocompleteTimeout: any;
  let lastSearchedUser = "";
  const cache: Record<string, string[]> = {};

  function handleUsernameInput() {
    if (autocompleteTimeout) clearTimeout(autocompleteTimeout);
    
    const trimmedUser = username.trim();
    if (!trimmedUser || trimmedUser.length < 3) {
      suggestions = [];
      return;
    }
    
    if (trimmedUser === lastSearchedUser) return;

    if (cache[trimmedUser]) {
      suggestions = cache[trimmedUser];
      return;
    }

    autocompleteTimeout = setTimeout(async () => {
      lastSearchedUser = trimmedUser;
      try {
        const res = await fetch(`https://api.github.com/users/${trimmedUser}/repos?per_page=100&sort=updated`);
        if (res.ok) {
          const data = await res.json();
          const repoNames = data.map((item: any) => item.name);
          cache[trimmedUser] = repoNames;
          suggestions = repoNames;
        } else {
          suggestions = [];
        }
      } catch (err) {
        console.error(err);
        suggestions = [];
      }
    }, 800);
  }
</script>

<aside class="sidebar-section">
  <!-- Compact App Branding Row -->
  <div class="app-branding">
    <div class="brand-left">
      <svg width="24" height="24" viewBox="0 0 253 207" fill="none" xmlns="http://www.w3.org/2000/svg" class="brand-logo">
        <path d="M131.884 187.208C99.5645 187.208 74.3805 180.936 56.3325 168.392C38.3485 155.848 29.3565 138.472 29.3565 116.264C29.3565 93.992 38.3485 76.584 56.3325 64.04C74.3805 51.496 99.5965 45.224 131.981 45.224C164.301 45.224 189.453 51.496 207.437 64.04C225.485 76.584 234.508 93.992 234.508 116.264C234.508 138.472 225.485 155.848 207.437 168.392C189.453 180.936 164.269 187.208 131.884 187.208ZM131.981 159.848C153.101 159.848 169.517 156.008 181.229 148.328C192.941 140.584 198.797 129.896 198.797 116.264C198.797 102.568 192.941 91.88 181.229 84.2C169.517 76.456 153.101 72.584 131.981 72.584C110.797 72.584 94.3485 76.456 82.6365 84.2C70.9245 91.88 65.0685 102.568 65.0685 116.264C65.0685 129.896 70.9245 140.584 82.6365 148.328C94.3485 156.008 110.797 159.848 131.981 159.848Z" fill="currentColor"/>
        <rect x="69.0965" y="149.43" width="150.011" height="31.2908" transform="rotate(-38.5227 69.0965 149.43)" fill="currentColor"/>
        <path d="M12.2404 19.5884C19.0005 14.2067 28.8434 15.3242 34.225 22.0844L83.0075 83.3624L58.5268 102.851L9.74434 41.5731C4.3627 34.8129 5.48021 24.97 12.2404 19.5884V19.5884Z" fill="currentColor"/>
        <path d="M240.241 14.5789C246.877 20.113 247.77 29.9788 242.236 36.6147L198.294 89.3058L174.263 69.265L218.205 16.574C223.739 9.93806 233.605 9.04485 240.241 14.5789V14.5789Z" fill="currentColor"/>
      </svg>
      <span class="brand-title">GH Release Stats</span>
    </div>
    <a href="https://github.com/kerneldroid/gh-stats" target="_blank" rel="noopener noreferrer" class="brand-link" title="GitHub Source">
      <Icon icon={iconOpenInNew} size={16} />
    </a>
  </div>

  <div class="search-card">
    <Card variant="filled">
      <div class="search-title-row">
        <Icon icon={iconSettings} size={20} />
        <h2 class="search-card-title">Enter project details</h2>
      </div>
      <form onsubmit={(e) => { e.preventDefault(); onsubmit(); }} class="search-form" aria-label="GitHub repository search">
        <TextField 
          id="username"
          label="User or organization name" 
          bind:value={username} 
          oninput={handleUsernameInput} 
          required 
          autocomplete="off"
          aria-required="true"
        />
        
        <TextField 
          id="repository"
          label="Repository name" 
          bind:value={repository} 
          list="repo-suggestions" 
          required 
          autocomplete="off"
          aria-required="true"
        />
        
        <datalist id="repo-suggestions">
          {#each suggestions as suggest}
            <option value={suggest}></option>
          {/each}
        </datalist>

        <Button 
          variant="filled" 
          type="submit" 
          iconType="left" 
          disabled={loading || !username.trim() || !repository.trim()}
          aria-label="Search release statistics"
        >
          <Icon icon={iconSearch} />
          Show release statistics!
        </Button>
      </form>
    </Card>
  </div>

  {#if avatarUrl}
    <div class="avatar-card">
      <Card variant="elevated">
        <div class="avatar-container">
          <img src={avatarUrl} alt="{username}'s GitHub avatar" class="user-avatar" />
          <div class="avatar-info">
            <h3>{username}</h3>
            <span class="theme-badge" aria-live="polite">Dynamic theme active</span>
          </div>
        </div>
      </Card>
    </div>
  {/if}

  <div class="examples-card">
    <Card variant="outlined">
      <h3>Quick Examples</h3>
      <p class="examples-desc">Select a repository to inspect its statistics instantly:</p>
      <div class="examples-list">
        <button type="button" class="example-btn" onclick={() => onselectExample("sveltejs", "svelte")}>
          sveltejs/svelte
        </button>
        <button type="button" class="example-btn" onclick={() => onselectExample("KTibow", "m3-svelte")}>
          KTibow/m3-svelte
        </button>
        <button type="button" class="example-btn" onclick={() => onselectExample("vitejs", "vite")}>
          vitejs/vite
        </button>
        <button type="button" class="example-btn" onclick={() => onselectExample("kerneldroid", "gh-stats")}>
          kerneldroid/gh-stats
        </button>
      </div>
    </Card>
  </div>
</aside>

<style>
  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .app-branding {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0.5rem;
    margin-bottom: 0.25rem;
    color: var(--m3c-on-surface);
  }

  .brand-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .brand-logo {
    color: var(--m3c-primary);
  }

  .brand-title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.3px;
  }

  .brand-link {
    color: var(--m3c-primary);
    opacity: 0.7;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
  }

  .brand-link:hover {
    opacity: 1;
  }

  .search-card :global(.m3-container) {
    padding: 1.5rem;
    border-radius: var(--m3-shape-large);
    background-color: var(--m3c-surface-container-low);
    border: 1px solid var(--m3c-outline-variant);
    width: 100%;
  }

  .search-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--m3c-primary);
    margin-bottom: 1.25rem;
  }

  .search-card-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.2px;
  }

  .search-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .search-form :global(.m3-container) {
    width: 100%;
    padding: 0;
    border: none;
    border-radius: 0;
  }

  .avatar-card :global(.m3-container) {
    background-color: var(--m3c-surface-container-low);
    border: 1px solid var(--m3c-outline-variant);
    padding: 1rem;
    width: 100%;
    border-radius: var(--m3-shape-medium);
  }
  
  .avatar-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 3px solid var(--m3c-primary);
    box-shadow: var(--m3-elevation-2);
    object-fit: cover;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .avatar-card:hover .user-avatar {
    transform: scale(1.1);
  }

  .avatar-info h3 {
    margin: 0 0 0.25rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--m3c-on-surface);
  }

  .theme-badge {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--m3c-primary);
    background-color: var(--m3c-primary-container-subtle);
    padding: 0.2rem 0.65rem;
    border-radius: var(--m3-shape-full);
    display: inline-block;
  }

  .examples-card :global(.m3-container) {
    padding: 1.25rem;
    border-radius: var(--m3-shape-medium);
    width: 100%;
  }

  .examples-card h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: var(--m3c-on-surface);
  }

  .examples-desc {
    font-size: 0.85rem;
    color: var(--m3c-on-surface-variant);
    margin: 0 0 1rem;
    line-height: 1.4;
  }

  .examples-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .example-btn {
    background-color: var(--m3c-surface-container-low);
    color: var(--m3c-primary);
    border: 1px solid var(--m3c-outline-variant);
    border-radius: var(--m3-shape-small);
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .example-btn:hover {
    background-color: var(--m3c-primary-container-subtle);
    border-color: var(--m3c-primary);
    transform: translateX(4px);
  }

  .example-btn:active {
    transform: scale(0.98) translateX(4px);
  }
</style>
