<script lang="ts">
  import { Card, Icon } from "m3-svelte";
  import iconDownload from "@ktibow/iconset-material-symbols/download";
  import iconTag from "@ktibow/iconset-material-symbols/sell";
  import iconPerson from "@ktibow/iconset-material-symbols/person";
</script>

<div class="welcome-card">
  <Card variant="filled">
    <div class="welcome-inner">
      <h2>Enter project details to start</h2>
      <p class="welcome-desc">
        Explore release statistics for any public GitHub repository. Get precise download counts, direct asset links, release history, and user feedback at a glance.
      </p>
      
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon-wrapper">
            <div class="feature-icon"><Icon icon={iconTag} size={28} /></div>
          </div>
          <h4>Tags & Dates</h4>
          <p>Track release version tag history, author info, and chronological release dates.</p>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon-wrapper">
            <div class="feature-icon"><Icon icon={iconDownload} size={28} /></div>
          </div>
          <h4>Download Statistics</h4>
          <p>Get instant total counts and asset-by-asset breakdowns of download metrics.</p>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon-wrapper">
            <div class="feature-icon"><Icon icon={iconPerson} size={28} /></div>
          </div>
          <h4>Dynamic Theming</h4>
          <p>Watch the entire app UI adapt seamlessly to the color scheme of the repository owner's avatar.</p>
        </div>
      </div>
    </div>
  </Card>
</div>

<style>
  .welcome-card :global(.m3-container) {
    padding: 2.5rem;
    width: 100%;
    border-radius: var(--m3-shape-large);
    background-color: var(--m3c-surface-container-low);
    border: 1px solid var(--m3c-outline-variant);
  }
  .welcome-inner {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .welcome-card h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.5px;
    color: var(--m3c-on-surface);
  }
  .welcome-desc {
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--m3c-on-surface-variant);
    margin: 0 0 2.5rem 0;
    max-width: 600px;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }
  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 1.5rem;
    background-color: var(--m3c-surface-container-lowest);
    border: 1px solid var(--m3c-outline-variant);
    border-radius: var(--m3-shape-medium);
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), 
                box-shadow 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
                border-color 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .feature-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--m3-elevation-2);
    border-color: var(--m3c-primary);
  }
  .feature-icon-wrapper {
    background-color: var(--m3c-primary-container-subtle);
    color: var(--m3c-primary);
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    transition: transform 0.3s ease;
  }
  .feature-item:hover .feature-icon-wrapper {
    transform: scale(1.1) rotate(5deg);
    background-color: var(--m3c-primary-container);
  }
  .feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .feature-item h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--m3c-on-surface);
  }
  .feature-item p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--m3c-on-surface-variant);
    line-height: 1.5;
  }
</style>
