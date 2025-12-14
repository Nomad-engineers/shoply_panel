export async function fetchWithSession(
  url: string,
  getAccessToken: () => string | null,
  refreshSession: () => Promise<string>
) {
  let token = getAccessToken();

  let res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 401) {
    token = await refreshSession();

    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  return res;
}
