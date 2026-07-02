<script lang="ts">
  import { Card, Icon, pathSunny } from "m3-svelte";
  import { untrack } from "svelte";
  import iconDownload from "@ktibow/iconset-material-symbols/download";

  let { total = 0, releases = [] } = $props<{ total: number; releases: any[] }>();
  let displayValue = $state(0);
  let hoveredPoint = $state<any | null>(null);

  $effect(() => {
    const end = total;
    
    untrack(() => {
      let start = displayValue;
      if (start === end) return;
      
      const duration = 800;
      let startTime: number | null = null;

      function animate(now: number) {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        let progress = elapsed / duration;
        
        if (progress > 1) progress = 1;

        const ease = progress * (2 - progress);
        displayValue = Math.floor(start + (end - start) * ease);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          displayValue = end;
        }
      }

      requestAnimationFrame(animate);
    });
  });

  const chartData = $derived(
    [...releases]
      .reverse()
      .map((rel: any) => ({
        tag: rel.tag_name,
        name: rel.name || rel.tag_name,
        downloads: rel.release_download_count || 0,
        date: new Date(rel.published_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
      }))
  );

  const width = 280;
  const height = 80;
  const padding = 8;

  const points = $derived.by(() => {
    if (chartData.length === 0) return [];

    const downloads = chartData.map(pt => pt.downloads);
    const maxVal = Math.max(...downloads, 1);
    const minVal = Math.min(...downloads);
    const useLog = minVal > 0 && maxVal / minVal > 10;
    const n = chartData.length;

    const scaleY = (v: number) => {
      if (useLog) {
        const logMax = Math.log10(maxVal + 1);
        return Math.log10(v + 1) / logMax;
      }
      return v / maxVal;
    };

    return chartData.map((d, i) => {
      const x = n > 1
        ? padding + (i / (n - 1)) * (width - 2 * padding)
        : width / 2;
      const y = height - padding - scaleY(d.downloads) * (height - 2 * padding);
      return { ...d, x, y };
    });
  });

  const linePath = $derived(
    points.length > 0
      ? `M ${points.map(p => `${p.x} ${p.y}`).join(" L ")}`
      : ""
  );

  const areaPath = $derived(
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : ""
  );
</script>

<div class="total-downloads-card" aria-live="polite">
  <Card variant="elevated">
    <div class="total-downloads-content">
      
      <div class="downloads-left">
        <div class="total-downloads-icon">
          <svg class="sunny-shape-bg" viewBox="0 0 380 380">
            <path d={pathSunny} fill="var(--m3c-primary)" />
          </svg>
          <div class="icon-on-top">
            <Icon icon={iconDownload} size={36} />
          </div>
        </div>
        <div class="total-downloads-text">
          <h2>{displayValue.toLocaleString()}</h2>
          <p>Total Downloads across all releases</p>
        </div>
      </div>

      {#if chartData.length > 0}
        <div class="downloads-right">
          <span class="chart-title">Download History</span>
          
          <div class="chart-svg-wrapper">
            <svg {width} {height} viewBox="0 0 {width} {height}" class="history-chart-svg">
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--m3c-on-primary-container)" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="var(--m3c-on-primary-container)" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              {#if areaPath}
                <path d={areaPath} fill="url(#chart-gradient)" />
              {/if}

              {#if linePath}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="var(--m3c-on-primary-container)" 
                  stroke-width="3" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                />
              {/if}

              {#each points as pt}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="3.5" 
                  fill="var(--m3c-on-primary-container)" 
                />
                
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="7" 
                  fill="var(--m3c-on-primary-container)" 
                  opacity={hoveredPoint?.tag === pt.tag ? 0.3 : 0} 
                  style="transition: opacity 0.15s ease;"
                />

                <!-- svelte-ignore a11y_mouse_events_have_key_events -->
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="16" 
                  role="presentation"
                  fill="transparent" 
                  style="cursor: pointer;"
                  onmouseover={() => hoveredPoint = pt}
                  onmouseout={() => hoveredPoint = null}
                />
              {/each}
            </svg>

            {#if hoveredPoint}
              <div class="chart-tooltip">
                <span class="tooltip-tag">{hoveredPoint.tag}</span>
                <span class="tooltip-downloads">{hoveredPoint.downloads.toLocaleString()} downloads</span>
                <span class="tooltip-date">{hoveredPoint.date}</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}

    </div>
  </Card>
</div>

<style>
  .total-downloads-card > :global(.m3-container) {
    background: linear-gradient(135deg, var(--m3c-primary-container) 0%, var(--m3c-secondary-container) 100%);
    color: var(--m3c-on-primary-container);
    margin-bottom: 2rem;
    width: 100%;
    border-radius: var(--m3-shape-large);
    box-shadow: var(--m3-elevation-2);
    overflow: visible;
    position: relative;
  }

  .total-downloads-card > :global(.m3-container)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 85% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
    pointer-events: none;
    border-radius: var(--m3-shape-large);
  }

  .total-downloads-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    padding: 1.25rem;
    width: 100%;
  }

  .downloads-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .downloads-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-grow: 1;
    max-width: 320px;
    position: relative;
  }

  @media (max-width: 650px) {
    .total-downloads-content {
      flex-direction: column;
      align-items: stretch;
      gap: 1.5rem;
    }
    .downloads-right {
      max-width: 100%;
      align-items: center;
    }
    .downloads-right svg {
      width: 100%;
    }
  }

  .total-downloads-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    filter: drop-shadow(var(--m3-elevation-2));
  }

  .sunny-shape-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    animation: spin-infinite 12s linear infinite;
  }

  .icon-on-top {
    position: relative;
    z-index: 2;
    color: var(--m3c-on-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes spin-infinite {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .total-downloads-card:hover .total-downloads-icon {
    transform: scale(1.1) rotate(-10deg);
  }

  .total-downloads-text {
    display: flex;
    flex-direction: column;
  }

  .total-downloads-text h2 {
    font-size: 2.75rem;
    font-weight: 800;
    margin: 0;
    line-height: 1;
    letter-spacing: -1.5px;
    font-family: var(--m3-font-mono);
  }

  .total-downloads-text p {
    margin: 0.35rem 0 0;
    font-size: 0.95rem;
    opacity: 0.9;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .chart-title {
    font-size: 0.7rem;
    font-weight: 800;
    opacity: 0.85;
    margin-bottom: 0.35rem;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .chart-svg-wrapper {
    position: relative;
    display: block;
  }

  .history-chart-svg {
    display: block;
    overflow: visible;
  }

  .chart-tooltip {
    position: absolute;
    top: -55px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--m3c-surface-container-high);
    border: 1px solid var(--m3c-outline-variant);
    border-radius: var(--m3-shape-small);
    padding: 0.35rem 0.65rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    box-shadow: var(--m3-elevation-3);
    z-index: 20;
    pointer-events: none;
    font-size: 0.75rem;
    color: var(--m3c-on-surface);
    white-space: nowrap;
    animation: fadeInTooltip 0.15s ease-out;
  }

  .tooltip-tag {
    font-weight: 700;
    color: var(--m3c-primary);
  }

  .tooltip-downloads {
    font-weight: 600;
  }

  .tooltip-date {
    opacity: 0.7;
    font-size: 0.65rem;
  }

  @keyframes fadeInTooltip {
    from {
      opacity: 0;
      transform: translate(-50%, 5px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
</style>
