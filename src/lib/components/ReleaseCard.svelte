<script lang="ts">
  import { Card, Divider, Icon, LoadingIndicator } from "m3-svelte";
  import { slide, fade } from "svelte/transition";
  import { toastState } from "../toast.svelte";

  import iconCalendar from "@ktibow/iconset-material-symbols/calendar-today";
  import iconPerson from "@ktibow/iconset-material-symbols/person";
  import iconTag from "@ktibow/iconset-material-symbols/sell";
  import iconDownload from "@ktibow/iconset-material-symbols/download";
  import iconInfo from "@ktibow/iconset-material-symbols/info";
  import iconCopy from "@ktibow/iconset-material-symbols/content-copy";
  import iconFilter from "@ktibow/iconset-material-symbols/filter-list";

  let {
    release,
    index,
    reactorsByRelease,
    reactorsLoading,
    onloadReactors
  } = $props<{
    release: any;
    index: number;
    reactorsByRelease: Record<number, Record<string, string[]>>;
    reactorsLoading: Record<number, boolean>;
    onloadReactors: (releaseId: number, reactionsUrl: string) => Promise<void>;
  }>();

  const isLatest = $derived(index === 0);
  
  let assetsExpanded = $state(false);
  let filterText = $state("");

  const filteredAssets = $derived(() => {
    if (!release.assets) return [];
    const term = filterText.trim().toLowerCase();
    if (!term) return release.assets;
    return release.assets.filter((asset: any) => 
      asset.name.toLowerCase().includes(term)
    );
  });

  const displayedAssets = $derived(() => {
    const list = filteredAssets();
    if (assetsExpanded || list.length <= 5) return list;
    return list.slice(0, 5);
  });

  const reactionEmojis: Record<string, string> = {
    "+1": "👍",
    "-1": "👎",
    "laugh": "😄",
    "confused": "😕",
    "heart": "❤️",
    "hooray": "🎉",
    "rocket": "🚀",
    "eyes": "👀"
  };

  function formatBytes(bytes: number): string {
    return (bytes / 1048576.0).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " MiB";
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  async function handleCopy(text: string, type: "tag" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      const msg = type === "tag" ? "Copied tag to clipboard!" : "Copied download link to clipboard!";
      toastState.show(msg, "success");
    } catch (err) {
      console.error(err);
      toastState.show("Failed to copy to clipboard", "error");
    }
  }

  const reactorGroups = $derived(
    reactorsByRelease[release.id]
      ? (Object.entries(reactorsByRelease[release.id]) as [string, string[]][])
      : []
  );
</script>

<div class="release-card" class:latest-card={isLatest}>
  <Card variant={isLatest ? "elevated" : "outlined"}>
    {#if isLatest}
      <div class="latest-ribbon" aria-label="Latest release badge">
        <span class="pulse-dot"></span>
        LATEST RELEASE
      </div>
    {/if}
    
    <div class="release-header">
      <div class="release-title-area">
        <div class="tag-icon">
          <Icon icon={iconTag} size={24} />
        </div>
        <h3 class="release-title">
          <a href={release.html_url} target="_blank" rel="noopener noreferrer">
            {release.name || release.tag_name}
          </a>
        </h3>
        <button 
          type="button" 
          class="copy-btn mini-copy" 
          onclick={() => handleCopy(release.tag_name, "tag")}
          title="Copy tag name"
          aria-label="Copy release tag name"
        >
          <Icon icon={iconCopy} size={16} />
        </button>
      </div>
      <div class="release-metadata">
        <span class="meta-item">
          <Icon icon={iconCalendar} size={16} />
          {formatDate(release.published_at)}
        </span>
        {#if release.author}
          <span class="meta-item">
            <Icon icon={iconPerson} size={16} />
            <a href={release.author.html_url} target="_blank" rel="noopener noreferrer" class="author-link">
              {release.author.login}
            </a>
          </span>
        {/if}
      </div>
    </div>

    <Divider />

    <div class="assets-container">
      <div class="assets-header">
        <h4 class="assets-title">
          <Icon icon={iconDownload} size={18} />
          Download Info ({release.assets.length} assets)
        </h4>

        {#if release.assets.length > 5}
          <div class="filter-wrapper">
            <div class="filter-icon">
              <Icon icon={iconFilter} size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Filter files..." 
              bind:value={filterText}
              class="asset-filter-input"
              aria-label="Filter assets list"
            />
            {#if filterText}
              <button 
                type="button" 
                class="clear-filter-btn" 
                onclick={() => filterText = ""}
                aria-label="Clear filter"
              >
                &times;
              </button>
            {/if}
          </div>
        {/if}
      </div>
      
      {#if release.assets.length > 0}
        {@const list = displayedAssets()}
        {#if list.length > 0}
          <ul class="assets-list">
            {#each list as asset (asset.id)}
              <li class="asset-item" in:fade={{ duration: 200 }}>
                <div class="asset-left">
                  <a href={asset.browser_download_url} class="asset-link" download>
                    {asset.name}
                  </a>
                  <span class="asset-size">({formatBytes(asset.size)})</span>
                  <button 
                    type="button" 
                    class="copy-btn mini-copy asset-copy"
                    onclick={() => handleCopy(asset.browser_download_url, "link")}
                    title="Copy direct download link"
                    aria-label="Copy download link"
                  >
                    <Icon icon={iconCopy} size={14} />
                  </button>
                </div>
                <div class="asset-right">
                  <span class="asset-updated">Updated: {formatDate(asset.updated_at)}</span>
                  <span class="asset-download-count">
                    <strong>{asset.download_count.toLocaleString()}</strong> downloads
                  </span>
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="no-assets-message">
            <Icon icon={iconInfo} size={18} />
            <em>No assets match "{filterText}"</em>
          </div>
        {/if}

        {#if filteredAssets().length > 5}
          <button 
            type="button" 
            class="expand-toggle-btn"
            onclick={() => assetsExpanded = !assetsExpanded}
          >
            {assetsExpanded ? "Show less files" : `Show all ${filteredAssets().length} files`}
          </button>
        {/if}
      {:else}
        <div class="no-assets-message">
          <Icon icon={iconInfo} size={18} />
          <em>This release has no download assets available!</em>
        </div>
      {/if}
    </div>

    {#if release.reactions && release.reactions.total_count > 0}
      <div class="reactions-wrapper">
        <span class="reactions-title">Reactions:</span>
        <div class="reactions-chips">
          {#each Object.entries(reactionEmojis) as [key, emoji]}
            {@const count = release.reactions[key]}
            {#if count > 0}
              <button 
                type="button" 
                class="reaction-chip" 
                class:has-reactors={reactorsByRelease[release.id]?.[key]}
                onclick={() => onloadReactors(release.id, release.reactions.url)}
                title="Click to view reactor logins"
                aria-label="{count} users reacted with {key}"
              >
                <span class="reaction-emoji">{emoji}</span>
                <span class="reaction-count">{count}</span>
              </button>
            {/if}
          {/each}
        </div>

        {#if reactorsLoading[release.id]}
          <div class="reactors-loading" in:fade={{ duration: 150 }}>
            <LoadingIndicator size={16} aria-label="Loading reactors list" />
            <span>Loading reactors...</span>
          </div>
        {:else if reactorsByRelease[release.id]}
          <div class="reactors-details" transition:slide={{ duration: 250 }}>
            <div class="reactors-details-header">
              <span class="detail-header-text">Reactors:</span>
              <button 
                type="button" 
                class="close-reactors-btn" 
                onclick={() => delete reactorsByRelease[release.id]}
                aria-label="Hide reactor list"
              >
                &times;
              </button>
            </div>
            {#each reactorGroups as [key, users]}
              <div class="reactor-group">
                <span class="group-emoji">{reactionEmojis[key] || key}</span>
                <span class="group-users">{users.join(", ")}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if release.release_download_count > 0}
      <div class="release-footer">
        <span>Release downloads: <strong>{release.release_download_count.toLocaleString()}</strong></span>
      </div>
    {/if}
  </Card>
</div>

<style>
  .release-card {
    position: relative;
    overflow: hidden;
    width: 100%;
  }

  .release-card :global(.m3-container) {
    width: 100%;
    border-radius: var(--m3-shape-large);
    overflow: visible;
  }

  .latest-card > :global(.m3-container) {
    border: 2px solid var(--m3c-primary);
    background-color: var(--m3c-primary-container-subtle);
    box-shadow: var(--m3-elevation-2);
  }

  .latest-ribbon {
    position: absolute;
    top: 0;
    right: 0;
    background-color: var(--m3c-primary);
    color: var(--m3c-on-primary);
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0.35rem 0.85rem;
    border-bottom-left-radius: var(--m3-shape-small);
    letter-spacing: 0.8px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: var(--m3-elevation-1);
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--m3c-on-primary);
    display: inline-block;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.85);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(0.85);
      opacity: 0.5;
    }
  }

  .release-header {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .latest-card .release-header {
    padding-right: 140px;
  }

  @media (max-width: 600px) {
    .latest-card .release-header {
      padding-right: 0;
      margin-top: 1.5rem; /* Push down to avoid overlapping the ribbon on mobile */
    }
  }

  .release-title-area {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--m3c-primary);
  }

  .release-title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .release-title a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
  }

  .release-title a:hover {
    text-decoration: underline;
  }

  .copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--m3c-on-surface-variant);
    opacity: 0.5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    opacity: 1;
    color: var(--m3c-primary);
    background-color: var(--m3c-surface-container-highest);
  }

  .copy-btn:active {
    transform: scale(0.9);
  }

  .release-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--m3c-on-surface-variant);
  }

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .author-link {
    color: inherit;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
  }

  .author-link:hover {
    color: var(--m3c-primary);
    text-decoration: underline;
  }

  .assets-container {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .assets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .assets-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0;
    color: var(--m3c-on-surface);
  }

  .filter-wrapper {
    display: flex;
    align-items: center;
    background-color: var(--m3c-surface-container-high);
    border: 1px solid var(--m3c-outline-variant);
    border-radius: var(--m3-shape-full);
    padding: 0.25rem 0.75rem;
    gap: 0.25rem;
    height: 32px;
    width: 180px;
    transition: width 0.3s, border-color 0.3s;
  }

  .filter-wrapper:focus-within {
    width: 220px;
    border-color: var(--m3c-primary);
  }

  .filter-icon {
    color: var(--m3c-on-surface-variant);
    display: flex;
    align-items: center;
  }

  .asset-filter-input {
    border: none;
    background: transparent;
    font-size: 0.8rem;
    width: 100%;
    color: var(--m3c-on-surface);
    font-family: var(--m3-font);
  }

  .asset-filter-input:focus {
    outline: none;
  }

  .clear-filter-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.1rem;
    color: var(--m3c-on-surface-variant);
    padding: 0;
    line-height: 1;
  }

  .assets-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .asset-item {
    background-color: var(--m3c-surface-container-low);
    border: 1px solid var(--m3c-outline-variant);
    padding: 0.65rem 1rem;
    border-radius: var(--m3-shape-small);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .asset-item:hover {
    background-color: var(--m3c-surface-container-high);
    border-color: var(--m3c-primary-container);
  }

  @media (max-width: 650px) {
    .asset-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.35rem;
      padding: 0.75rem 1rem;
    }
  }

  .asset-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .asset-link {
    font-weight: 600;
    color: var(--m3c-primary);
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s;
    word-break: break-all;
  }

  .asset-link:hover {
    text-decoration: underline;
  }

  .asset-size {
    font-size: 0.8rem;
    color: var(--m3c-on-surface-variant);
  }

  .asset-copy {
    opacity: 0;
    width: 24px;
    height: 24px;
  }

  .asset-item:hover .asset-copy {
    opacity: 0.6;
  }

  .asset-copy:hover {
    opacity: 1 !important;
  }

  .asset-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 0.8rem;
    color: var(--m3c-on-surface-variant);
    flex-shrink: 0;
  }

  @media (max-width: 650px) {
    .asset-right {
      align-items: flex-start;
      margin-top: 0.15rem;
    }
    .asset-copy {
      opacity: 0.5;
    }
  }

  .asset-download-count {
    color: var(--m3c-on-surface);
  }

  .expand-toggle-btn {
    background: none;
    border: 1px dashed var(--m3c-outline);
    color: var(--m3c-primary);
    border-radius: var(--m3-shape-small);
    padding: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
  }

  .expand-toggle-btn:hover {
    background-color: var(--m3c-primary-container-subtle);
    border-style: solid;
    border-color: var(--m3c-primary);
  }

  .no-assets-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background-color: var(--m3c-surface-container-lowest);
    border: 1px dashed var(--m3c-outline-variant);
    border-radius: var(--m3-shape-small);
    color: var(--m3c-on-surface-variant);
    font-size: 0.9rem;
  }

  .release-footer {
    margin-top: 1rem;
    text-align: right;
    font-size: 0.85rem;
    color: var(--m3c-on-surface-variant);
  }

  .reactions-wrapper {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: var(--m3c-surface-container-low);
    border: 1px solid var(--m3c-outline-variant);
    border-radius: var(--m3-shape-small);
  }

  .reactions-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--m3c-on-surface-variant);
    display: block;
    margin-bottom: 0.5rem;
  }

  .reactions-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .reaction-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.65rem;
    background-color: var(--m3c-surface-container-high);
    border: 1px solid var(--m3c-outline-variant);
    border-radius: var(--m3-shape-full);
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--m3c-on-surface);
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .reaction-chip:hover {
    background-color: var(--m3c-primary-container-subtle);
    border-color: var(--m3c-primary);
    transform: scale(1.08);
  }

  .reaction-chip:active {
    transform: scale(0.95);
  }

  .reaction-chip.has-reactors {
    background-color: var(--m3c-secondary-container);
    border-color: var(--m3c-secondary);
    color: var(--m3c-on-secondary-container);
  }

  .reaction-emoji {
    font-size: 1rem;
  }

  .reaction-count {
    font-weight: 700;
  }

  .reactors-loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    font-size: 0.8rem;
    color: var(--m3c-on-surface-variant);
  }

  .reactors-details {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: var(--m3c-surface-container-highest);
    border: 1px solid var(--m3c-outline-variant);
    border-radius: var(--m3-shape-small);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .reactors-details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--m3c-outline-variant);
    padding-bottom: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .detail-header-text {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--m3c-on-surface);
  }

  .close-reactors-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: var(--m3c-on-surface-variant);
    line-height: 1;
    padding: 0;
  }

  .close-reactors-btn:hover {
    color: var(--m3c-primary);
  }

  .reactor-group {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  .group-emoji {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .group-users {
    color: var(--m3c-on-surface-variant);
    word-break: break-all;
    line-height: 1.4;
    font-weight: 600;
  }
</style>
