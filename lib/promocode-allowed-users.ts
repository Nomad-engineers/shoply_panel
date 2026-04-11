export async function attachAllowedUsersToPromocode(params: {
  promocodeId: number;
  userIds: number[];
  accessToken: string;
  refreshSession: () => Promise<string>;
}) {
  const uniqueUserIds = Array.from(new Set(params.userIds));
  let token = params.accessToken;

  const doRequest = async (currentToken: string) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode/allowed-user/${params.promocodeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ userIds: uniqueUserIds }),
    });

  let res = await doRequest(token);
  if (res.status === 401) {
    token = await params.refreshSession();
    res = await doRequest(token);
  }

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.message || "Не удалось привязать пользователей к промокоду");
  }
}
