export const AGENT_URL = window.location.protocol === 'https:'
    ? ''
    : (import.meta.env.VITE_AGENT_URL || 'http://localhost:4000');

export const IFRAME_URL = "https://bfoziodo4xibb3bu0c5lwz7nfk5h5t0y.ui.nabu.casa/ac-units/0";
