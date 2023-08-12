import { BeaconBeaconToken, VestingVesting } from "@/validators/plutus";
import { C, Constr, Data, Lucid, UTxO, WalletApi, fromHex } from "lucid-cardano";

export const tokenNameFromHex = (assetName: string) => {
    return Buffer.from(assetName, 'hex').toString('utf-8')
}
export const getAssetsFromStakeAddress = async (lucid: Lucid) => {
    const stakeAddress = await lucid.wallet.rewardAddress()
    let allBalance: any = [];
    try {
        let paginating = true;
        let page = 1;
        while (paginating) {
            try {
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
                    assetName: tokenNameFromHex(assetName),
                    quantity: v.quantity,
                };
            });
        console.log({ resp })
        return resp
    } catch (e) {
        console.log(e)
    }
    console.log({ allBalance })
    return allBalance
}

const getPaymentKeyHash = (address: any) => {
    try {
        const pkh = C.BaseAddress.from_address(
            C.Address.from_bytes(address.to_bytes())
        )
        if (!pkh) throw ""
        const pkh2 = pkh
            .payment_cred()
            .to_keyhash()
        if (!pkh2) throw ""
        return Buffer.from(
            pkh2
                .to_bytes()
        ).toString('hex');
    } catch (e) { }
    try {
        const pkh = C.EnterpriseAddress.from_address(
            C.Address.from_bytes(address.to_bytes())
        )
        if (!pkh) throw ""
        const pkh2 = pkh
            .payment_cred()
            .to_keyhash()
        if (!pkh2) throw ""
        return Buffer.from(
            pkh2
                .to_bytes()
        ).toString('hex');
    } catch (e) { }
    try {
        const pkh = C.PointerAddress.from_address(
            C.Address.from_bytes(address.to_bytes())
        )
        if (!pkh) throw ""
        const pkh2 = pkh
            .payment_cred()
            .to_keyhash()
        if (!pkh2) throw ""
        return Buffer.from(
            pkh2
                .to_bytes()
        ).toString('hex');
    } catch (e) { }
    throw Error('Not supported address type');
};

export const getUserAddressesAndPkhs = async (walletName: string) => {
    const walletApi = await window?.cardano[walletName]?.enable()
    const unused = await walletApi.getUnusedAddresses()
    const used = await walletApi.getUsedAddresses()
    const all = unused.concat(used)
    const addresses = all.map((addr: any) => {
        try {
            const address = C.Address.from_bytes(
                fromHex(addr),
            )

            return (
                {
                    address: address.to_bech32(undefined),
                    pkh: getPaymentKeyHash(address)
                }
            )
        } catch (e) {
            console.log(e)
            return null
        }

    })
        .filter((addr: any) => addr !== null)
    console.log({ addresses })
    return addresses
}

export const getUtxosForAddresses = async (lucid: Lucid, contractAddress: string, addresses: ({ address: string, pkh: string } | null)[]) => {
    // TO DO: check multiple addresses
    const utxos = await lucid.utxosAt(contractAddress)
    const formattedUtxos = []
    const totals: { [key: string]: bigint } = {}
    const claimable: {
        assets: {
            [key: string]: bigint

        },
        utxos: UTxO[]
    } = { assets: {}, utxos: [] }
    for (let utxo of utxos) {
        try {
            const datum: Constr<any> = await lucid.datumOf(utxo)
            console.log({ datum })
            // const datumJSON = Data.toJson(Data.from(datum))
            // const datumJSON = Data.toJson(datum)  //for latest lucid
            //console.log({datumJSON})
            const datumJSON = { beneficiary: datum.fields[0], date: Number(datum.fields[1]) }
            console.log({ datumJSON })
            if (addresses.filter((addr) => addr?.pkh === datumJSON?.beneficiary).length === 0) continue
            formattedUtxos.push({ ...utxo, datum: datumJSON })

            for (let assetName of Object.keys(utxo.assets)) {
                const amount = utxo.assets[assetName]
                totals[assetName] = totals[assetName] ? totals[assetName] + amount : amount
                if (datumJSON?.date < Date.now()) {
                    console.log({ date: datumJSON.date })
                    claimable.assets[assetName] = claimable.assets[assetName] ? claimable.assets[assetName] + BigInt(amount) : BigInt(amount)
                }
            }
            if (datumJSON?.date < Date.now()) {
                console.log({ utxo, date: datumJSON.date })
                claimable.utxos = [...claimable.utxos, utxo]
            }

            // const datumJSON =  Data.toJson(datum)

        } catch (e) {
            console.log(e)
        }


    }

    return { utxos: formattedUtxos, claimable, totals }
}

export const getOrgDatumsAndAmount = async (lucid: Lucid, orgPolicy: string) => {
    const vestingValidator = new VestingVesting()
    const myAddress = "addr_test1qrsaj9wppjzqq9aa8yyg4qjs0vn32zjr36ysw7zzy9y3xztl9fadz30naflhmq653up3tkz275gh5npdejwjj23l0rdquxfsdj"
    const myAddressDetails = lucid?.utils.getAddressDetails(myAddress)
    const stakeCredential = myAddressDetails?.stakeCredential
    const beaconPolicy = new BeaconBeaconToken(lucid!.utils.validatorToScriptHash(vestingValidator), stakeCredential!.hash)
    const beaconPolicyId = lucid!.utils.mintingPolicyToId(beaconPolicy)
    const contractAddress = lucid!.utils.validatorToAddress(vestingValidator, stakeCredential)
    let orgUtxos = await lucid!.utxosAtWithUnit(contractAddress, beaconPolicyId + orgPolicy)
    console.log({ orgUtxos })
    const datums = orgUtxos.filter((utxo: UTxO) => utxo.datum !== null).map((utxo: UTxO) => {
        const convertedDatum = Data.from(utxo.datum as string, VestingVesting.datum)
        return {
            datum: convertedDatum,
            tokenAmount: utxo.assets[beaconPolicyId + orgPolicy]
        }
    })
    return datums
}

export const getOrgStats = async (lucid: Lucid, orgPolicy: string) => {
    const vestingValidator = new VestingVesting()
    const myAddress = "addr_test1qrsaj9wppjzqq9aa8yyg4qjs0vn32zjr36ysw7zzy9y3xztl9fadz30naflhmq653up3tkz275gh5npdejwjj23l0rdquxfsdj"
    const myAddressDetails = lucid?.utils.getAddressDetails(myAddress)
    const stakeCredential = myAddressDetails?.stakeCredential
    const beaconPolicy = new BeaconBeaconToken(lucid!.utils.validatorToScriptHash(vestingValidator), stakeCredential!.hash)
    const beaconPolicyId = lucid!.utils.mintingPolicyToId(beaconPolicy)
    const contractAddress = lucid!.utils.validatorToAddress(vestingValidator, stakeCredential)
    let orgUtxos = await lucid!.utxosAtWithUnit(contractAddress, beaconPolicyId + orgPolicy)
    console.log({ orgUtxos })
    let stats: Stats = { beneficiaries: {}, totals: {} }
    const datums = orgUtxos.filter((utxo: UTxO) => utxo.datum !== null).forEach((utxo: UTxO) => {
        const datum = Data.from(utxo.datum as string, VestingVesting.datum)
        console.log({datum})
        const assetName = datum.tokenPolicyId+datum.tokenName;
        const tokenAmount= utxo.assets[beaconPolicyId + orgPolicy] // amount of tokens remaining in the UTxO
        const totalVested = datum.amountPerPeriod * datum.numPeriods;
        const withdrawn = totalVested - tokenAmount;
        const remaining = totalVested - withdrawn;
        const withdrawablePeriods = Date.now() > Number(datum.date)+Number(datum.periodLength)*24*60*60*1000 ?  Math.floor(((Date.now() - Number(datum.date))/60/60/24) / Number(datum.periodLength)) : 0;
        const withdrawableToDate = withdrawablePeriods > 0 ? BigInt(withdrawablePeriods) * datum.amountPerPeriod : BigInt(0);
        const redeemable = withdrawableToDate - withdrawn; // amount withdrawable to date discounting what has already been withdrawn
        let utxos: UTxO[] = [utxo]
        // Populate beneficiaries
        if (!stats.beneficiaries[datum.beneficiary]) {
            stats.beneficiaries[datum.beneficiary] = {};
        }else{
            utxos = stats.beneficiaries[datum.beneficiary][assetName]?.utxos ? [...stats.beneficiaries[datum.beneficiary][assetName].utxos, utxo] : [utxo]
        }
        stats.beneficiaries[datum.beneficiary][assetName] = {
            totalVested,
            redeemable,
            withdrawn,
            remaining,
            withdrawablePeriods,
            utxos
        };

        // Populate totals
        if (!stats.totals[assetName]) {
            stats.totals[assetName] = {
                totalVested: BigInt(0),
                redeemable: BigInt(0),
                withdrawn: BigInt(0),
                remaining: BigInt(0)
            };
        }
        stats.totals[assetName].totalVested += totalVested;
        stats.totals[assetName].redeemable += redeemable;
        stats.totals[assetName].withdrawn += withdrawn;
        stats.totals[assetName].remaining += remaining;
    })
    return stats
}

type Stats = {
    beneficiaries: {
        [key: string]: { //beneficiary
            [key: string]: {  // asset name of vested token
                totalVested: bigint,
                withdrawablePeriods: number,
                redeemable: bigint,
                withdrawn: bigint,
                remaining: bigint,
                utxos: UTxO[]
            }
        }
    },
    totals: {
        [key: string]: {  // asset name of vested token
            totalVested: bigint,
            redeemable: bigint,
            withdrawn: bigint,
            remaining: bigint,
        }
    }
}