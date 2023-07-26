import { Lucid } from "lucid-cardano";

export const getAssetsFromStakeAddress = async (lucid: Lucid) => {
    const stakeAddress = await lucid.wallet.rewardAddress()
    let allBalance: any = [];
    try {
        let paginating = true;
        let page = 1;
        while (paginating) {
            try {
                console.log(page)
                const res = await fetch(`${process.env.NEXT_PUBLIC_BLOCKFROST_URL}/accounts/${stakeAddress}/addresses/assets?page=${page}`,
                    {
                        headers: {
                            'project_id': process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY as string
                        }
                    }
                )
                const resp: { unit: string, quantity: string }[] = await res.json()
                if (resp.length === 0) {
                    paginating = false;
                    break;
                }
                allBalance = [...allBalance, ...resp]
                page++;
            } catch (e) {
                paginating = false;
            }
        }
        const resp = allBalance
            .filter((v: any) => v.unit !== 'lovelace' && BigInt(v.quantity) > BigInt(1))
            .map((v: any) => {
                const policyId = v.unit.slice(0, 56);
                const assetName = v.unit.slice(56);
                return {
                    unit: v.unit,
                    policyId,
                    assetName: Buffer.from(assetName, 'hex').toString('utf-8'),
                    quantity: v.quantity,
                };
            });
            console.log({resp})
            return resp
    } catch (e) {
        console.log(e)
    }
    console.log({ allBalance })
    return allBalance
}