export const fetchWithSession = async (url: string) => {
  let accessToken = localStorage.getItem("access_token");

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  let res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    const refresh = localStorage.getItem("refresh_token");
    const refreshRes = await fetch(`${directusUrl}/auth/refresh`, {
      method: "POST",
      body: JSON.stringify({ refresh_token: refresh }),
      headers: { "Content-Type": "application/json" },
    });
    if (!refreshRes.ok) throw new Error("Не авторизован");
    const data = await refreshRes.json();
    accessToken = data.data.access_token;
    localStorage.setItem("access_token", accessToken as string);
    localStorage.setItem("refresh_token", data.data.refresh_token);
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
  return res;
};
