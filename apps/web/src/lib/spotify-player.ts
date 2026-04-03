interface SpotifyEmbedController {
  play(): void;
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

export function loadSpotifyAndPlay(
  spotifyId: string,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  function create(IFrameAPI: SpotifyIFrameAPI) {
    if (!containerRef.current) return;
    IFrameAPI.createController(
      containerRef.current,
      { uri: `spotify:track:${spotifyId}`, width: '0', height: '0' },
      (controller) => {
        controller.play();
      },
    );
  }

  if (window.SpotifyIframeApi) {
    create(window.SpotifyIframeApi);
    return;
  }

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    window.SpotifyIframeApi = IFrameAPI;
    create(IFrameAPI);
  };

  if (!document.getElementById('spotify-iframe-api')) {
    const s = document.createElement('script');
    s.id = 'spotify-iframe-api';
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    document.head.appendChild(s);
  }
}
