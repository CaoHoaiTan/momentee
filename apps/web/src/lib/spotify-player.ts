interface SpotifyEmbedController {
  play(): void;
  togglePlay(): void;
  destroy(): void;
  addListener(event: string, callback: (data: unknown) => void): void;
}

interface SpotifyIFrameAPI {
  createController(
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyEmbedController) => void,
  ): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void;
    SpotifyIframeApi?: SpotifyIFrameAPI;
  }
}

function ensureApiLoaded(): Promise<SpotifyIFrameAPI> {
  if (window.SpotifyIframeApi) {
    return Promise.resolve(window.SpotifyIframeApi);
  }

  return new Promise((resolve) => {
    const prev = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      window.SpotifyIframeApi = IFrameAPI;
      prev?.(IFrameAPI);
      resolve(IFrameAPI);
    };

    if (!document.getElementById('spotify-iframe-api')) {
      const s = document.createElement('script');
      s.id = 'spotify-iframe-api';
      s.src = 'https://open.spotify.com/embed/iframe-api/v1';
      s.async = true;
      document.head.appendChild(s);
    }
  });
}

// Global container that lives in the DOM permanently
let globalContainer: HTMLDivElement | null = null;

function getGlobalContainer(): HTMLDivElement {
  if (globalContainer && globalContainer.isConnected) return globalContainer;

  globalContainer = document.createElement('div');
  globalContainer.id = 'spotify-playback-container';
  globalContainer.style.cssText = 'position:fixed;bottom:-200px;left:0;width:300px;height:80px;opacity:0;pointer-events:none;z-index:-1;';
  document.body.appendChild(globalContainer);
  return globalContainer;
}

export function stopSpotifyPlayback() {
  const container = document.getElementById('spotify-playback-container');
  if (container) {
    container.innerHTML = '';
  }
}

export function loadSpotifyAndPlay(
  spotifyId: string,
  _containerRef?: { current: HTMLDivElement | null },
) {
  const container = getGlobalContainer();
  // Clear previous
  container.innerHTML = '';

  // Create fresh element
  const el = document.createElement('div');
  container.appendChild(el);

  const api = window.SpotifyIframeApi;
  if (api) {
    api.createController(
      el,
      { uri: `spotify:track:${spotifyId}`, width: 300, height: 80 },
      (controller) => {
        controller.play();
      },
    );
  } else {
    ensureApiLoaded().then((loadedApi) => {
      loadedApi.createController(
        el,
        { uri: `spotify:track:${spotifyId}`, width: 300, height: 80 },
        (controller) => {
          controller.play();
        },
      );
    });
  }
}
