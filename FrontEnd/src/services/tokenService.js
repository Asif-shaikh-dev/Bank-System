// Access token lives ONLY in memory (a module-level variable).
// Never put it in localStorage/sessionStorage — that's what makes it
// safe from XSS. It's fine that it disappears on page reload; the
// AuthProvider re-fetches it from the httpOnly refreshToken cookie
// on every app boot (see store/AuthContext.jsx).

let accessToken = null;

const tokenService = {
  getToken: () => accessToken,
  setToken: (token) => {
    accessToken = token;
  },
  clearToken: () => {
    accessToken = null;
  },
};

export default tokenService;