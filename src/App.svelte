<script lang="ts">
  import { onMount } from "svelte";
  import { 
    Card, 
    Icon, 
    LoadingIndicator,
    NavCMLX,
    NavCMLXItem
  } from "m3-svelte";

  import { applyDefaultTheme, applyThemeFromAvatar } from "./lib/theme";

  import Footer from "./lib/components/Footer.svelte";
  import Sidebar from "./lib/components/Sidebar.svelte";
  import TotalDownloads from "./lib/components/TotalDownloads.svelte";
  import ReleaseCard from "./lib/components/ReleaseCard.svelte";
  import WelcomePanel from "./lib/components/WelcomePanel.svelte";
  import Toast from "./lib/components/Toast.svelte";

  import iconSettings from "@ktibow/iconset-material-symbols/settings";
  import iconAnalytics from "@ktibow/iconset-material-symbols/monitoring";
  import iconError from "@ktibow/iconset-material-symbols/error";

  let username = $state("");
  let repository = $state("");
  let loading = $state(false);
  let errorMsg = $state("");
  let stats = $state<any[] | null>(null);
  let avatarUrl = $state("");
  let totalDownloads = $state(0);

  let activeTab = $state("search");

  let reactorsByRelease = $state<Record<number, Record<string, string[]>>>({});
  let reactorsLoading = $state<Record<number, boolean>>({});

  async function fetchStats() {
    const trimmedUser = username.trim();
    const trimmedRepo = repository.trim();
    if (!trimmedUser || !trimmedRepo) return;
    
    activeTab = "stats";
    loading = true;
    errorMsg = "";
    stats = null;
    totalDownloads = 0;
    reactorsByRelease = {};
    reactorsLoading = {};

    const url = new URL(window.location.href);
    url.searchParams.set("username", trimmedUser);
    url.searchParams.set("repository", trimmedRepo);
    window.history.pushState({}, "", url.toString());

    try {
      avatarUrl = `https://avatars.githubusercontent.com/${trimmedUser}`;
      applyThemeFromAvatar(avatarUrl).catch(err => console.error(err));
    } catch (err) {
      console.error(err);
    }

    try {
      let allReleases: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await fetch(`https://api.github.com/repos/${trimmedUser}/${trimmedRepo}/releases?page=${page}&per_page=100`);
        if (!res.ok) {
          if (page === 1) {
            if (res.status === 404) {
              errorMsg = "The project does not exist!";
            } else if (res.status === 403) {
              errorMsg = "You've exceeded GitHub's rate limiting. Please try again in about an hour.";
            } else {
              errorMsg = `Error: ${res.statusText} (${res.status})`;
            }
            loading = false;
            return;
          }
          break;
        }

        const data = await res.json();
        if (data.length === 0) {
          hasMore = false;
        } else {
          allReleases = [...allReleases, ...data];
          if (data.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      if (allReleases.length === 0) {
        errorMsg = "There are no releases for this project";
        loading = false;
        return;
      }

      allReleases.sort((a: any, b: any) => {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });

      let grandTotal = 0;
      allReleases.forEach((release: any) => {
        let releaseTotal = 0;
        release.assets.forEach((asset: any) => {
          releaseTotal += asset.download_count;
          grandTotal += asset.download_count;
        });
        release.release_download_count = releaseTotal;
      });

      totalDownloads = grandTotal;
      stats = allReleases;
      
      document.title = `${trimmedUser}/${trimmedRepo} - GitHub Release Stats`;
    } catch (err) {
      errorMsg = "An error occurred while fetching release stats.";
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function loadReactors(releaseId: number, reactionsUrl: string) {
    if (reactorsByRelease[releaseId] || reactorsLoading[releaseId]) return;
    
    reactorsLoading[releaseId] = true;
    try {
      const res = await fetch(reactionsUrl, {
        headers: {
          "Accept": "application/vnd.github.squirrel-preview+json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        const grouped: Record<string, string[]> = {};
        
        data.forEach((r: any) => {
          const content = r.content;
          if (!grouped[content]) {
            grouped[content] = [];
          }
          if (!grouped[content].includes(r.user.login)) {
            grouped[content].push(r.user.login);
          }
        });
        
        reactorsByRelease[releaseId] = grouped;
      }
    } catch (err) {
      console.error(err);
    } finally {
      reactorsLoading[releaseId] = false;
    }
  }

  function handleSelectExample(user: string, repo: string) {
    username = user;
    repository = repo;
    fetchStats();
  }

  onMount(() => {
    applyDefaultTheme();

    const params = new URLSearchParams(window.location.search);
    const u = params.get("username");
    const r = params.get("repository");
    if (u && r) {
      username = u;
      repository = r;
      fetchStats();
    }
  });
</script>

<div class="mobile-nav-container">
  <NavCMLX variant="compact">
    <NavCMLXItem 
      variant="compact" 
      icon={iconSettings} 
      text="Configure" 
      selected={activeTab === "search"} 
      onclick={() => activeTab = "search"} 
    />
    <NavCMLXItem 
      variant="compact" 
      icon={iconAnalytics} 
      text="Statistics" 
      selected={activeTab === "stats"} 
      onclick={() => activeTab = "stats"} 
    />
  </NavCMLX>
</div>

<main class="app-container" class:show-search={activeTab === "search"} class:show-stats={activeTab === "stats"}>
  <div class="sidebar-wrapper">
    <Sidebar 
      bind:username={username}
      bind:repository={repository}
      loading={loading}
      avatarUrl={avatarUrl}
      onsubmit={fetchStats}
      onselectExample={handleSelectExample}
    />
  </div>

  <section class="results-section">
    {#if loading}
      <div class="state-container loading-state" aria-live="assertive">
        <LoadingIndicator size={48} aria-label="Loading repository statistics" />
        <p>Fetching repository details and applying avatar theme...</p>
      </div>
    {:else if errorMsg}
      <div class="error-card" aria-live="assertive">
        <Card variant="filled">
          <div class="error-content">
            <div class="error-icon">
              <Icon icon={iconError} size={36} />
            </div>
            <div class="error-text">
              <h3>Something went wrong</h3>
              <p>{errorMsg}</p>
            </div>
          </div>
        </Card>
      </div>
    {:else if stats}
      <TotalDownloads total={totalDownloads} releases={stats || []} />

      <div class="releases-list">
        {#each stats as release, index (release.id)}
          <ReleaseCard 
            release={release}
            index={index}
            reactorsByRelease={reactorsByRelease}
            reactorsLoading={reactorsLoading}
            onloadReactors={loadReactors}
          />
        {/each}
      </div>
    {:else}
      <WelcomePanel />
    {/if}
  </section>
</main>

<Footer />

<Toast />

<style>
  .mobile-nav-container {
    display: none;
  }

  .app-container {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2.5rem 2rem;
    min-height: calc(100vh - 120px);
  }

  @media (max-width: 900px) {
    .mobile-nav-container {
      display: block;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      border-top: 1px solid var(--m3c-outline-variant);
      background-color: var(--m3c-surface-container);
      box-shadow: var(--m3-elevation-2);
    }

    .mobile-nav-container :global(nav.m3-container) {
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 4rem !important;
      height: 64px !important;
      background-color: var(--m3c-surface-container) !important;
      padding: 0 !important;
    }

    .mobile-nav-container :global(.m3-container.compact) {
      flex: 0 1 80px !important;
      height: 100% !important;
      justify-content: center !important;
      align-items: center !important;
    }

    .mobile-nav-container :global(.m3-container.compact .content) {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 4px !important;
      width: 100% !important;
    }
    
    .app-container {
      grid-template-columns: 1fr;
      padding: 1.5rem 1rem 5.5rem 1rem;
      gap: 1.5rem;
      min-height: calc(100vh - 180px);
    }
    
    .app-container.show-search .results-section {
      display: none !important;
    }
    .app-container.show-stats .sidebar-wrapper {
      display: none !important;
    }
  }

  .state-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    gap: 1.5rem;
    text-align: center;
    color: var(--m3c-on-surface-variant);
  }
  
  .state-container p {
    font-size: 1.05rem;
    font-weight: 500;
  }

  .error-card > :global(.m3-container) {
    background-color: var(--m3c-error-container);
    color: var(--m3c-on-error-container);
    width: 100%;
    border-radius: var(--m3-shape-large);
  }
  
  .error-content {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 0.5rem;
  }
  
  .error-icon {
    background-color: var(--m3c-error);
    color: var(--m3c-on-error);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .error-text h3 {
    margin: 0 0 0.25rem;
    font-size: 1.15rem;
    font-weight: 700;
  }
  
  .error-text p {
    margin: 0;
    font-size: 0.95rem;
    opacity: 0.85;
  }

  .releases-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  .results-section {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
</style>
