export default {
  async fetch(request) {
    const url = new URL(request.url);

    const STUDIO_HOST = "lomuz-studio.pages.dev";

    if (url.pathname === "/studio" || url.pathname.startsWith("/studio/")) {
      url.hostname = STUDIO_HOST;
      return fetch(url.toString(), request);
    }

    return fetch(request);
  }
};
