<script lang="ts">
  import { Icon } from "m3-svelte";
  import iconOpenInNew from "@ktibow/iconset-material-symbols/open-in-new";
</script>

<header class="app-header">
  <div class="header-content">
    <div class="logo-area">
      <div class="logo-icon">
        <svg width="32" height="32" viewBox="0 0 253 207" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M131.884 187.208C99.5645 187.208 74.3805 180.936 56.3325 168.392C38.3485 155.848 29.3565 138.472 29.3565 116.264C29.3565 93.992 38.3485 76.584 56.3325 64.04C74.3805 51.496 99.5965 45.224 131.981 45.224C164.301 45.224 189.453 51.496 207.437 64.04C225.485 76.584 234.508 93.992 234.508 116.264C234.508 138.472 225.485 155.848 207.437 168.392C189.453 180.936 164.269 187.208 131.884 187.208ZM131.981 159.848C153.101 159.848 169.517 156.008 181.229 148.328C192.941 140.584 198.797 129.896 198.797 116.264C198.797 102.568 192.941 91.88 181.229 84.2C169.517 76.456 153.101 72.584 131.981 72.584C110.797 72.584 94.3485 76.456 82.6365 84.2C70.9245 91.88 65.0685 102.568 65.0685 116.264C65.0685 129.896 70.9245 140.584 82.6365 148.328C94.3485 156.008 110.797 159.848 131.981 159.848Z" fill="currentColor"/>
          <rect x="69.0965" y="149.43" width="150.011" height="31.2908" transform="rotate(-38.5227 69.0965 149.43)" fill="currentColor"/>
          <path d="M12.2404 19.5884C19.0005 14.2067 28.8434 15.3242 34.225 22.0844L83.0075 83.3624L58.5268 102.851L9.74434 41.5731C4.3627 34.8129 5.48021 24.97 12.2404 19.5884V19.5884Z" fill="currentColor"/>
          <path d="M240.241 14.5789C246.877 20.113 247.77 29.9788 242.236 36.6147L198.294 89.3058L174.263 69.265L218.205 16.574C223.739 9.93806 233.605 9.04485 240.241 14.5789V14.5789Z" fill="currentColor"/>
        </svg>
      </div>
      <h1>GitHub Release Stats</h1>
    </div>
    
    <div class="header-links">
      <a href="https://github.com/somsubhra/github-release-stats" target="_blank" rel="noopener noreferrer">
        <Icon icon={iconOpenInNew} size={18} />
        GitHub Source
      </a>
    </div>
  </div>
</header>

<style>
  .app-header {
    background-color: var(--m3c-surface-container-high);
    color: var(--m3c-on-surface);
    border-bottom: 1px solid var(--m3c-outline-variant);
    padding: 1rem 2rem;
    box-shadow: var(--m3-elevation-1);
    position: relative;
    z-index: 50;
  }
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }
  .logo-area {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .logo-icon {
    color: var(--m3c-primary);
    display: flex;
    align-items: center;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .logo-area:hover .logo-icon {
    transform: rotate(-15deg) scale(1.1);
  }
  .app-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
    background: linear-gradient(90deg, var(--m3c-primary) 0%, var(--m3c-secondary) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .header-links a {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--m3c-primary);
    text-decoration: none;
    padding: 0.5rem 0.75rem;
    border-radius: var(--m3-shape-small);
    transition: background-color 0.2s, transform 0.2s;
  }
  .header-links a:hover {
    background-color: var(--m3c-surface-container-highest);
    transform: translateY(-1px);
  }
</style>
