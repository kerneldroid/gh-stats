<script lang="ts">
</script>

<footer class="app-footer">
  <div class="footer-content">
    <p>
      Originally made with ♥ by 
      <a href="https://github.com/Somsubhra" target="_blank" rel="noopener noreferrer">Somsubhra</a>. 
      Rewritten with M3 Svelte.
    </p>
  </div>
</footer>

<style>
  .app-footer {
    background-color: var(--m3c-surface-container-high);
    border-top: 1px solid var(--m3c-outline-variant);
    padding: 1.5rem;
    text-align: center;
    color: var(--m3c-on-surface-variant);
    font-size: 0.85rem;
    position: relative;
    z-index: 10;
  }
  .app-footer a {
    color: var(--m3c-primary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s, text-decoration 0.2s;
  }
  .app-footer a:hover {
    color: var(--m3c-primary);
    text-decoration: underline;
  }
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  .footer-content p {
    margin: 0;
  }
</style>
