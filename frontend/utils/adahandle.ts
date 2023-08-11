export const resolveHandle = async (query: string) => {
    if (!query.startsWith("$")) return null;

    const handle = query.replace("$", "")

    if (!handle) return null

    const assetName = Buffer.from(handle).toString("hex");

    const data = await fetch(
        `${process.env.BLOCKFROST_URL}/assets/f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a${assetName}/addresses`,
        {
            headers: {
                project_id: process.env.BLOCKFROST_PROJECT_ID as string,
                "Content-Type": "application/json",
            },
        },
    ).then((res) => res.json());

    if (!data?.error) {
        const [{ address }] = data;
        return address;
    } else {
        return (null)
    }
};